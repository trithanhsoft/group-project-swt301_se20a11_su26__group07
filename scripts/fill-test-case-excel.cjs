const fs = require('fs');
const path = require('path');
const XLSX = require('../frontend/node_modules/xlsx');

const TESTING_DIR = path.join(__dirname, '..', 'Testing');
const INPUT_XLSX = 'c:\\Users\\Admin\\Downloads\\test case.xlsx';
const OUTPUT_XLSX = 'c:\\Users\\Admin\\Downloads\\test case.xlsx';
const BACKUP_XLSX = path.join(__dirname, '..', 'documents', 'test case - filled.xlsx');

const MODULE_FILES = [
  '01-auth-and-access-control',
  '02-dashboard',
  '03-user-management',
  '04-profile-management',
  '05-product-management',
  '06-ingredient-management',
  '07-stock-management',
  '08-recipe-management',
  '09-pos-ordering',
  '10-order-history-and-detail',
  '11-kds',
  '12-reports',
  '13-hr-management',
  '14-attendance',
  '15-end-to-end-regression',
  '16-edge-cases-and-ui-resilience',
];

function parseMarkdownTableRows(content) {
  const lines = content.split(/\r?\n/);
  const rows = [];
  for (const line of lines) {
    if (!/^\| [A-Z0-9]+-\d+ \|/.test(line)) continue;
    const cells = line
      .split('|')
      .slice(1, -1)
      .map((c) => c.trim());
    if (cells.length < 4) continue;
    if (cells[0] === 'ID') continue;
    rows.push({
      id: cells[0],
      type: cells[1],
      scenario: cells[2],
      expected: cells[3],
    });
  }
  return rows;
}

function parseReportStatusMap(content) {
  const map = new Map();
  const lines = content.split(/\r?\n/);
  for (const line of lines) {
    if (!/^\| [A-Z0-9]+-\d+ \|/.test(line)) continue;
    const cells = line
      .split('|')
      .slice(1, -1)
      .map((c) => c.trim());
    if (cells.length < 5 || cells[0] === 'ID') continue;
    const status = cells[4].replace(/\*\*/g, '').trim();
    const notes = cells[5] || '';
    map.set(cells[0], { status, notes });
  }
  return map;
}

function getModuleTitle(content, fallback) {
  const match = content.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : fallback;
}

function normalizeStatus(status) {
  if (!status) return 'Not yet';
  if (/passed/i.test(status)) return 'Passed';
  if (/failed/i.test(status)) return 'Failed';
  if (/skip|n\/a/i.test(status)) return 'N/A';
  return status;
}

function collectTestCases() {
  const allCases = [];
  for (const base of MODULE_FILES) {
    const testPath = path.join(TESTING_DIR, `${base}.md`);
    const reportPath = path.join(TESTING_DIR, 'reports', `${base}-report.md`);
    const testContent = fs.readFileSync(testPath, 'utf8');
    const reportContent = fs.existsSync(reportPath)
      ? fs.readFileSync(reportPath, 'utf8')
      : '';
    const moduleName = getModuleTitle(testContent, base);
    const statusMap = parseReportStatusMap(reportContent);
    const rows = parseMarkdownTableRows(testContent);
    for (const row of rows) {
      const report = statusMap.get(row.id) || {};
      allCases.push({
        ...row,
        moduleName,
        status: normalizeStatus(report.status),
        notes: report.notes || '',
      });
    }
  }
  return allCases;
}

function countByStatus(cases, status) {
  return cases.filter((c) => c.status === status).length;
}

function fillWorkbook(cases) {
  const wb = XLSX.readFile(INPUT_XLSX);
  const ws = wb.Sheets['Test case'];

  const passed = countByStatus(cases, 'Passed');
  const failed = countByStatus(cases, 'Failed');
  const na = countByStatus(cases, 'N/A');
  const notYet = countByStatus(cases, 'Not yet');
  const total = cases.length;

  const setCell = (addr, value) => {
    ws[addr] = { t: 's', v: String(value) };
  };

  setCell('C2', 'MCP');
  setCell('C3', 'Mini Coffee POS - Full system functional, integration and regression testing');
  setCell('C4', 'Group 07');
  setCell('A6', passed);
  setCell('B6', failed);
  setCell('C6', na);
  setCell('D6', notYet);
  setCell('E6', total);
  setCell('A7', passed);
  setCell('B7', failed);
  setCell('C7', na);
  setCell('D7', notYet);
  setCell('E7', total);

  const headerRow = 9;
  const startRow = 10;
  const maxRows = 1000;
  for (let r = startRow; r <= maxRows; r++) {
    for (let c = 0; c <= 13; c++) {
      const col = XLSX.utils.encode_col(c);
      const addr = `${col}${r}`;
      if (ws[addr]) delete ws[addr];
    }
  }

  cases.forEach((tc, idx) => {
    const r = startRow + idx;
    const row = [
      tc.id,
      tc.moduleName,
      tc.type,
      tc.scenario,
      '',
      '',
      '',
      tc.expected,
      tc.status,
      'N/A',
      tc.notes,
      null,
      null,
      null,
    ];
    row.forEach((value, colIdx) => {
      if (value === null || value === undefined || value === '') return;
      const addr = `${XLSX.utils.encode_col(colIdx)}${r}`;
      ws[addr] = typeof value === 'number' ? { t: 'n', v: value } : { t: 's', v: String(value) };
    });
  });

  const range = XLSX.utils.decode_range(ws['!ref'] || 'A1:N1000');
  range.e.r = Math.max(range.e.r, startRow + cases.length - 1);
  ws['!ref'] = XLSX.utils.encode_range(range);

  const bugWs = wb.Sheets['Bug report'];
  const setCellBug = (addr, value) => {
    bugWs[addr] = typeof value === 'number' ? { t: 'n', v: value } : { t: 's', v: String(value) };
  };
  setCellBug('A3', 0);
  setCellBug('B3', 0);
  setCellBug('C3', 0);
  setCellBug('D3', 0);
  setCellBug('E3', 0);
  setCellBug('F3', 0);

  for (let r = 6; r <= 20; r++) {
    for (let c = 0; c <= 11; c++) {
      const addr = `${XLSX.utils.encode_col(c)}${r}`;
      if (bugWs[addr]) delete bugWs[addr];
    }
  }

  if (failed === 0) {
    setCellBug('A6', 1);
    setCellBug('B6', 'N/A');
    setCellBug('C6', 'No bugs found during test execution');
    setCellBug('H6', 'All test cases passed');
    setCellBug('I6', 'Web - Chrome/Edge');
    setCellBug('J6', 'Low');
    setCellBug('L6', 'Closed');
    setCellBug('E3', 1);
    setCellBug('F3', 1);
  }

  return wb;
}

const cases = collectTestCases();
console.log(`Collected ${cases.length} test cases`);
console.log('Passed:', countByStatus(cases, 'Passed'));
console.log('Failed:', countByStatus(cases, 'Failed'));
console.log('Not yet:', countByStatus(cases, 'Not yet'));

const wb = fillWorkbook(cases);
fs.mkdirSync(path.dirname(BACKUP_XLSX), { recursive: true });
XLSX.writeFile(wb, OUTPUT_XLSX);
XLSX.writeFile(wb, BACKUP_XLSX);
console.log('Saved:', OUTPUT_XLSX);
console.log('Backup:', BACKUP_XLSX);
