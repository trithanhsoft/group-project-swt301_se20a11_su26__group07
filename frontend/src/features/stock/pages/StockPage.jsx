import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ClipboardCheck,
  Download,
  Eraser,
  FileSpreadsheet,
  History,
  PackagePlus,
  RefreshCw,
  Upload,
} from 'lucide-react';
import { stockApi } from '../api/stockApi.js';
import { ingredientApi } from '../../ingredients/api/ingredientApi.js';
import { PageHeader } from '../../../components/layout/PageHeader.jsx';
import { Button } from '../../../components/common/Button.jsx';
import { Alert } from '../../../components/feedback/Alert.jsx';
import { Toast } from '../../../components/feedback/Toast.jsx';
import { TextInput } from '../../../components/forms/TextInput.jsx';
import { TextareaInput } from '../../../components/forms/TextareaInput.jsx';
import { Card } from '../../../components/common/Card.jsx';
import { CompactCode, buildCompactCode } from '../../../components/common/CompactCode.jsx';
import { ROUTES } from '../../../constants/routes.js';
import { validateNonNegativeNumber, validatePositiveNumber } from '../../../utils/validators.js';
import {
  downloadStockTemplate,
  parseStockTemplateFile,
  STOCK_TEMPLATE_MODES,
} from '../utils/stockSpreadsheet.js';

const STOCK_MODES = Object.freeze({
  IMPORT: 'IMPORT',
  DAILY_COUNT: 'DAILY_COUNT',
});

function getTodayDateString() {
  return new Date().toISOString().slice(0, 10);
}

function createImportDraft(ingredients) {
  return Object.fromEntries(
    ingredients.map((ingredient) => [
      ingredient.id,
      {
        quantity: '',
        note: '',
      },
    ]),
  );
}

function createCountDraft(ingredients) {
  return Object.fromEntries(
    ingredients.map((ingredient) => [
      ingredient.id,
      {
        actualStock: String(ingredient.currentStock ?? 0),
        note: '',
      },
    ]),
  );
}

function normalizeNumericInput(value) {
  return String(value ?? '').replace(',', '.');
}

function formatDisplayNumber(value) {
  const numericValue = Number(value || 0);

  if (Number.isNaN(numericValue)) {
    return '0';
  }

  return numericValue % 1 === 0 ? String(numericValue) : numericValue.toFixed(2);
}

function buildInputStyle(hasError) {
  return hasError
    ? {
        borderColor: 'var(--color-error)',
        boxShadow: '0 0 0 1px var(--color-error)',
      }
    : undefined;
}

export function StockPage() {
  const navigate = useNavigate();
  const importFileInputRef = useRef(null);
  const countFileInputRef = useRef(null);

  const [ingredients, setIngredients] = useState([]);
  const [activeMode, setActiveMode] = useState(STOCK_MODES.IMPORT);
  const [searchQuery, setSearchQuery] = useState('');
  const [importRows, setImportRows] = useState({});
  const [countRows, setCountRows] = useState({});
  const [importErrors, setImportErrors] = useState({});
  const [countErrors, setCountErrors] = useState({});
  const [importBatchNote, setImportBatchNote] = useState('');
  const [countBatchNote, setCountBatchNote] = useState('');
  const [countDate, setCountDate] = useState(getTodayDateString());
  const [submitError, setSubmitError] = useState('');
  const [toastMsg, setToastMsg] = useState('');
  const [toastType, setToastType] = useState('success');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isImportingFile, setIsImportingFile] = useState(false);

  const applyFreshIngredientData = (nextIngredients) => {
    const sortedIngredients = [...nextIngredients].sort((left, right) =>
      left.name.localeCompare(right.name, 'vi'),
    );

    setIngredients(sortedIngredients);
    setImportRows(createImportDraft(sortedIngredients));
    setCountRows(createCountDraft(sortedIngredients));
    setImportErrors({});
    setCountErrors({});
  };

  const loadIngredients = async () => {
    setIsLoading(true);
    setSubmitError('');

    try {
      const response = await ingredientApi.getIngredients();
      applyFreshIngredientData(response.data.ingredients || []);
    } catch (loadError) {
      setIngredients([]);
      setImportRows({});
      setCountRows({});
      setSubmitError(loadError.message || 'Không tải được danh sách nguyên liệu.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadIngredients();
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  const visibleIngredients = ingredients.filter((ingredient) => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      return true;
    }

    return [
      ingredient.name,
      ingredient.unit,
      ingredient.id,
      buildCompactCode(ingredient.id, 'NL'),
    ]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(normalizedQuery));
  });

  const readyImportRows = ingredients.filter((ingredient) => {
    const quantity = Number(importRows[ingredient.id]?.quantity || 0);
    return Number.isFinite(quantity) && quantity > 0;
  });

  const totalImportQuantity = readyImportRows.reduce(
    (sum, ingredient) => sum + Number(importRows[ingredient.id]?.quantity || 0),
    0,
  );

  const countPreviewRows = ingredients.map((ingredient) => {
    const actualStock = Number(countRows[ingredient.id]?.actualStock ?? ingredient.currentStock ?? 0);
    const differenceQuantity = actualStock - Number(ingredient.currentStock || 0);

    return {
      ingredientId: ingredient.id,
      differenceQuantity,
    };
  });

  const changedCountRows = countPreviewRows.filter((row) => row.differenceQuantity !== 0);
  const totalCountDifference = countPreviewRows.reduce(
    (sum, row) => sum + row.differenceQuantity,
    0,
  );

  const handleImportRowChange = (ingredientId, fieldName, value) => {
    setImportRows((current) => ({
      ...current,
      [ingredientId]: {
        ...current[ingredientId],
        [fieldName]: fieldName === 'quantity' ? normalizeNumericInput(value) : value,
      },
    }));

    if (importErrors[ingredientId]) {
      setImportErrors((current) => ({ ...current, [ingredientId]: '' }));
    }

    setSubmitError('');
  };

  const handleCountRowChange = (ingredientId, fieldName, value) => {
    setCountRows((current) => ({
      ...current,
      [ingredientId]: {
        ...current[ingredientId],
        [fieldName]: fieldName === 'actualStock' ? normalizeNumericInput(value) : value,
      },
    }));

    if (countErrors[ingredientId]) {
      setCountErrors((current) => ({ ...current, [ingredientId]: '' }));
    }

    setSubmitError('');
  };

  const clearImportInputs = () => {
    setImportRows(createImportDraft(ingredients));
    setImportErrors({});
    setImportBatchNote('');
  };

  const resetCountInputs = () => {
    setCountRows(createCountDraft(ingredients));
    setCountErrors({});
    setCountBatchNote('');
    setCountDate(getTodayDateString());
  };

  const handleDownloadTemplate = async (mode) => {
    try {
      await downloadStockTemplate({
        mode:
          mode === STOCK_MODES.IMPORT ? STOCK_TEMPLATE_MODES.IMPORT : STOCK_TEMPLATE_MODES.DAILY_COUNT,
        ingredients,
        fileNameDate: mode === STOCK_MODES.DAILY_COUNT ? countDate : getTodayDateString(),
      });
    } catch (downloadError) {
      setToastType('error');
      setToastMsg(downloadError.message || 'Không tạo được file Excel mẫu.');
    }
  };

  const handleTemplateUpload = async (mode, file) => {
    if (!file) {
      return;
    }

    setIsImportingFile(true);
    setSubmitError('');

    try {
      const parsedRows = await parseStockTemplateFile(
        file,
        mode === STOCK_MODES.IMPORT ? STOCK_TEMPLATE_MODES.IMPORT : STOCK_TEMPLATE_MODES.DAILY_COUNT,
      );

      if (mode === STOCK_MODES.IMPORT) {
        const nextRows = createImportDraft(ingredients);
        let appliedRows = 0;

        for (const row of parsedRows) {
          if (!nextRows[row.ingredientId]) {
            continue;
          }

          nextRows[row.ingredientId] = {
            quantity: row.quantity,
            note: row.note,
          };
          appliedRows += 1;
        }

        setImportRows(nextRows);
        setImportErrors({});
        setToastType('success');
        setToastMsg(`Đã nạp ${appliedRows} dòng nhập kho từ file Excel.`);
      } else {
        const nextRows = createCountDraft(ingredients);
        let appliedRows = 0;

        for (const row of parsedRows) {
          if (!nextRows[row.ingredientId]) {
            continue;
          }

          nextRows[row.ingredientId] = {
            actualStock: row.actualStock,
            note: row.note,
          };
          appliedRows += 1;
        }

        setCountRows(nextRows);
        setCountErrors({});
        setToastType('success');
        setToastMsg(`Đã nạp ${appliedRows} dòng kiểm kê từ file Excel.`);
      }
    } catch (fileError) {
      setToastType('error');
      setToastMsg(fileError.message || 'Không đọc được file Excel đã chọn.');
    } finally {
      setIsImportingFile(false);
    }
  };

  const handleImportSubmit = async (e) => {
    e.preventDefault();

    const nextErrors = {};
    const items = [];

    for (const ingredient of ingredients) {
      const row = importRows[ingredient.id] || {};
      const quantityValue = row.quantity ?? '';

      if (String(quantityValue).trim() === '') {
        continue;
      }

      const quantityError = validatePositiveNumber(quantityValue, `Số lượng nhập của ${ingredient.name}`);

      if (quantityError) {
        nextErrors[ingredient.id] = quantityError;
        continue;
      }

      items.push({
        ingredientId: ingredient.id,
        quantity: Number(quantityValue),
        note: row.note?.trim() || '',
      });
    }

    setImportErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setSubmitError('Vui lòng kiểm tra lại các ô số lượng nhập đang bị lỗi.');
      return;
    }

    if (items.length === 0) {
      setSubmitError('Cần nhập ít nhất một dòng có số lượng lớn hơn 0.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const response = await stockApi.importStockBatch({
        note: importBatchNote.trim(),
        items,
      });

      const processedCount = response.data?.processedCount || items.length;

      setToastType('success');
      setToastMsg(`Nhập kho thành công cho ${processedCount} nguyên liệu.`);
      clearImportInputs();
      await loadIngredients();
    } catch (saveError) {
      setSubmitError(saveError.message || 'Nhập kho hàng loạt thất bại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDailyCountSubmit = async (e) => {
    e.preventDefault();

    const nextErrors = {};
    const items = ingredients.map((ingredient) => {
      const row = countRows[ingredient.id] || {};
      const actualStockValue = row.actualStock ?? '';
      const actualStockError = validateNonNegativeNumber(
        actualStockValue,
        `Tồn thực tế của ${ingredient.name}`,
      );

      if (actualStockError) {
        nextErrors[ingredient.id] = actualStockError;
      }

      return {
        ingredientId: ingredient.id,
        actualStock: Number(actualStockValue),
        note: row.note?.trim() || '',
      };
    });

    setCountErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setSubmitError('Vui lòng kiểm tra lại các ô tồn thực tế đang bị lỗi.');
      return;
    }

    if (!countDate) {
      setSubmitError('Vui lòng chọn ngày kiểm kê.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const response = await stockApi.countDailyStock({
        countDate,
        note: countBatchNote.trim(),
        items,
      });

      const changedCount = response.data?.changedCount || 0;
      const unchangedCount = response.data?.unchangedCount || 0;

      setToastType('success');
      setToastMsg(
        `Kiểm kê hoàn tất: ${changedCount} dòng có chênh lệch, ${unchangedCount} dòng khớp tồn lý thuyết.`,
      );
      resetCountInputs();
      await loadIngredients();
    } catch (saveError) {
      setSubmitError(saveError.message || 'Ghi nhận kiểm kê ngày thất bại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderModeButton = (mode, label, icon) => (
    <button
      type="button"
      onClick={() => setActiveMode(mode)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '12px 16px',
        borderRadius: 'var(--radius-default)',
        border: '1px solid var(--color-primary)',
        backgroundColor:
          activeMode === mode
            ? 'var(--color-sidebar-background)'
            : 'var(--color-primary-container)',
        color: 'var(--color-on-primary)',
        cursor: 'pointer',
        fontWeight: '600',
        boxShadow: activeMode === mode ? 'var(--shadow-low)' : 'none',
      }}
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
      <PageHeader
        title="Quản lý kho hàng"
        description="Tách riêng luồng nhập hàng mới và kiểm kê ngày, hỗ trợ thao tác hàng loạt bằng file Excel."
        actions={
          <Button
            variant="secondary"
            onClick={() => navigate(ROUTES.ADMIN_STOCK_TRANSACTIONS)}
            icon={<History size={16} />}
          >
            Xem lịch sử giao dịch
          </Button>
        }
      />

      {submitError && <Alert type="error" message={submitError} onClose={() => setSubmitError('')} />}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--spacing-md)' }}>
        <Card
          title={activeMode === STOCK_MODES.IMPORT ? 'Dòng sẵn sàng nhập' : 'Nguyên liệu kiểm kê'}
          value={activeMode === STOCK_MODES.IMPORT ? readyImportRows.length : ingredients.length}
          subtext={
            activeMode === STOCK_MODES.IMPORT
              ? 'Chỉ gửi các dòng có số lượng nhập lớn hơn 0'
              : 'Danh sách được nạp sẵn từ tồn lý thuyết hiện tại'
          }
          icon={activeMode === STOCK_MODES.IMPORT ? <PackagePlus size={22} /> : <ClipboardCheck size={22} />}
          loading={isLoading}
        />
        <Card
          title={activeMode === STOCK_MODES.IMPORT ? 'Tổng lượng nhập' : 'Dòng có chênh lệch'}
          value={
            activeMode === STOCK_MODES.IMPORT
              ? formatDisplayNumber(totalImportQuantity)
              : changedCountRows.length
          }
          subtext={
            activeMode === STOCK_MODES.IMPORT
              ? 'Tổng cộng của các ô nhập đã điền'
              : 'Những dòng sẽ tạo điều chỉnh tồn kho'
          }
          icon={<FileSpreadsheet size={22} />}
          loading={isLoading}
        />
        <Card
          title={activeMode === STOCK_MODES.IMPORT ? 'Dòng đang hiển thị' : 'Tổng chênh lệch'}
          value={
            activeMode === STOCK_MODES.IMPORT
              ? visibleIngredients.length
              : `${totalCountDifference > 0 ? '+' : ''}${formatDisplayNumber(totalCountDifference)}`
          }
          subtext={
            activeMode === STOCK_MODES.IMPORT
              ? 'Bị ảnh hưởng bởi tìm kiếm hiện tại'
              : 'Dương là tăng tồn, âm là hao hụt so với lý thuyết'
          }
          icon={<RefreshCw size={22} />}
          loading={isLoading}
        />
      </div>

      <div className="card" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        {renderModeButton(STOCK_MODES.IMPORT, 'Nhập hàng mới vào kho', <PackagePlus size={18} />)}
        {renderModeButton(STOCK_MODES.DAILY_COUNT, 'Kiểm kê hàng theo ngày', <ClipboardCheck size={18} />)}
      </div>

      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
        <div style={{ display: 'flex', gap: 'var(--spacing-md)', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: 1, minWidth: '260px' }}>
            <TextInput
              label="Tìm nguyên liệu"
              name="searchQuery"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên, mã ngắn hoặc mã hệ thống..."
              disabled={isLoading || isSubmitting}
            />
          </div>

          {activeMode === STOCK_MODES.DAILY_COUNT && (
            <div style={{ width: '200px' }}>
              <TextInput
                label="Ngày kiểm kê"
                name="countDate"
                type="date"
                value={countDate}
                onChange={(e) => setCountDate(e.target.value)}
                disabled={isLoading || isSubmitting}
              />
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <Button
              variant="secondary"
              onClick={() => void handleDownloadTemplate(activeMode)}
              disabled={isLoading || ingredients.length === 0 || isSubmitting}
              icon={<Download size={16} />}
            >
              Tải mẫu Excel
            </Button>
            <Button
              variant="secondary"
              onClick={() =>
                activeMode === STOCK_MODES.IMPORT
                  ? importFileInputRef.current?.click()
                  : countFileInputRef.current?.click()
              }
              disabled={isLoading || isSubmitting || isImportingFile}
              icon={<Upload size={16} />}
            >
              {isImportingFile ? 'Đang đọc file...' : 'Nạp file Excel'}
            </Button>
            <Button
              variant="secondary"
              onClick={() => void loadIngredients()}
              disabled={isLoading || isSubmitting}
              icon={<RefreshCw size={16} />}
            >
              Tải lại tồn kho
            </Button>
          </div>
        </div>

        <input
          ref={importFileInputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          style={{ display: 'none' }}
          onChange={(e) => {
            const file = e.target.files?.[0];
            void handleTemplateUpload(STOCK_MODES.IMPORT, file);
            e.target.value = '';
          }}
        />

        <input
          ref={countFileInputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          style={{ display: 'none' }}
          onChange={(e) => {
            const file = e.target.files?.[0];
            void handleTemplateUpload(STOCK_MODES.DAILY_COUNT, file);
            e.target.value = '';
          }}
        />

        {activeMode === STOCK_MODES.IMPORT ? (
          <form onSubmit={handleImportSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(260px, 1fr)', gap: 'var(--spacing-lg)' }}>
              <TextareaInput
                label="Ghi chú chung cho đợt nhập"
                name="importBatchNote"
                value={importBatchNote}
                onChange={(e) => setImportBatchNote(e.target.value)}
                placeholder="Ví dụ: nhập hàng đầu ngày, nhập theo phiếu NCC số 25..."
                rows={3}
                disabled={isLoading || isSubmitting}
              />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ fontSize: '14px', color: 'var(--color-secondary)' }}>
                  Mẫu Excel đã có sẵn toàn bộ nguyên liệu. Bạn chỉ cần sửa cột số lượng nhập rồi nạp lại file để điền hàng loạt.
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    variant="secondary"
                    onClick={clearImportInputs}
                    disabled={isLoading || isSubmitting}
                    icon={<Eraser size={16} />}
                  >
                    Xóa các ô đã nhập
                  </Button>
                </div>
              </div>
            </div>

            <div className="table-container">
              <table className="data-table" style={{ minWidth: '1100px' }}>
                <thead>
                  <tr>
                    <th style={{ width: '124px' }}>Mã NL</th>
                    <th style={{ minWidth: '240px' }}>Tên nguyên liệu</th>
                    <th style={{ width: '90px', textAlign: 'center' }}>Đơn vị</th>
                    <th style={{ width: '130px', textAlign: 'right' }}>Tồn hiện tại</th>
                    <th style={{ width: '180px' }}>Số lượng nhập</th>
                    <th style={{ minWidth: '240px' }}>Ghi chú theo dòng</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: 'var(--spacing-xl)' }}>
                        <div className="spinner" style={{ margin: '0 auto 12px' }}></div>
                        <span style={{ color: 'var(--color-secondary)' }}>Đang tải danh sách nguyên liệu...</span>
                      </td>
                    </tr>
                  ) : visibleIngredients.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: 'var(--spacing-xl)', color: 'var(--color-secondary)' }}>
                        Không có nguyên liệu nào phù hợp với bộ lọc hiện tại.
                      </td>
                    </tr>
                  ) : (
                    visibleIngredients.map((ingredient) => {
                      const row = importRows[ingredient.id] || { quantity: '', note: '' };
                      const rowError = importErrors[ingredient.id];

                      return (
                        <tr key={ingredient.id}>
                          <td>
                            <CompactCode value={ingredient.id} prefix="NL" />
                          </td>
                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <strong style={{ color: 'var(--color-primary)' }}>{ingredient.name}</strong>
                              <span style={{ fontSize: '12px', color: 'var(--color-secondary)' }}>
                                ID: {ingredient.id}
                              </span>
                            </div>
                          </td>
                          <td style={{ textAlign: 'center', fontWeight: '600' }}>{ingredient.unit}</td>
                          <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
                            {formatDisplayNumber(ingredient.currentStock)} {ingredient.unit}
                          </td>
                          <td>
                            <input
                              type="text"
                              inputMode="decimal"
                              value={row.quantity}
                              onChange={(e) =>
                                handleImportRowChange(ingredient.id, 'quantity', e.target.value)
                              }
                              placeholder="Ví dụ: 500"
                              disabled={isSubmitting}
                              className="form-control"
                              style={buildInputStyle(Boolean(rowError))}
                            />
                            {rowError && (
                              <div style={{ color: 'var(--color-error)', fontSize: '12px', marginTop: '6px' }}>
                                {rowError}
                              </div>
                            )}
                          </td>
                          <td>
                            <input
                              type="text"
                              value={row.note}
                              onChange={(e) =>
                                handleImportRowChange(ingredient.id, 'note', e.target.value)
                              }
                              placeholder="Ghi chú tùy chọn"
                              disabled={isSubmitting}
                              className="form-control"
                            />
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                type="submit"
                variant="primary"
                loading={isSubmitting}
                icon={<PackagePlus size={16} />}
                disabled={isLoading || isImportingFile}
              >
                Xác nhận nhập kho hàng loạt
              </Button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleDailyCountSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(260px, 1fr)', gap: 'var(--spacing-lg)' }}>
              <TextareaInput
                label="Ghi chú chung cho phiên kiểm kê"
                name="countBatchNote"
                value={countBatchNote}
                onChange={(e) => setCountBatchNote(e.target.value)}
                placeholder="Ví dụ: kiểm kê cuối ngày, đối chiếu ca tối..."
                rows={3}
                disabled={isLoading || isSubmitting}
              />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ fontSize: '14px', color: 'var(--color-secondary)' }}>
                  Mỗi dòng sẽ so sánh tồn lý thuyết hiện có với tồn thực tế bạn nhập. Những dòng có chênh lệch sẽ được ghi thành điều chỉnh kho để đưa vào báo cáo sau này.
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    variant="secondary"
                    onClick={resetCountInputs}
                    disabled={isLoading || isSubmitting}
                    icon={<Eraser size={16} />}
                  >
                    Đặt lại theo tồn lý thuyết
                  </Button>
                </div>
              </div>
            </div>

            <div className="table-container">
              <table className="data-table" style={{ minWidth: '1180px' }}>
                <thead>
                  <tr>
                    <th style={{ width: '124px' }}>Mã NL</th>
                    <th style={{ minWidth: '240px' }}>Tên nguyên liệu</th>
                    <th style={{ width: '90px', textAlign: 'center' }}>Đơn vị</th>
                    <th style={{ width: '140px', textAlign: 'right' }}>Tồn lý thuyết</th>
                    <th style={{ width: '180px' }}>Tồn thực tế</th>
                    <th style={{ width: '140px', textAlign: 'right' }}>Chênh lệch</th>
                    <th style={{ minWidth: '240px' }}>Ghi chú theo dòng</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: 'var(--spacing-xl)' }}>
                        <div className="spinner" style={{ margin: '0 auto 12px' }}></div>
                        <span style={{ color: 'var(--color-secondary)' }}>Đang tải danh sách nguyên liệu...</span>
                      </td>
                    </tr>
                  ) : visibleIngredients.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: 'var(--spacing-xl)', color: 'var(--color-secondary)' }}>
                        Không có nguyên liệu nào phù hợp với bộ lọc hiện tại.
                      </td>
                    </tr>
                  ) : (
                    visibleIngredients.map((ingredient) => {
                      const row = countRows[ingredient.id] || {
                        actualStock: String(ingredient.currentStock ?? 0),
                        note: '',
                      };
                      const rowError = countErrors[ingredient.id];
                      const actualStock = Number(row.actualStock ?? ingredient.currentStock ?? 0);
                      const differenceQuantity = actualStock - Number(ingredient.currentStock || 0);

                      return (
                        <tr key={ingredient.id}>
                          <td>
                            <CompactCode value={ingredient.id} prefix="NL" />
                          </td>
                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <strong style={{ color: 'var(--color-primary)' }}>{ingredient.name}</strong>
                              <span style={{ fontSize: '12px', color: 'var(--color-secondary)' }}>
                                ID: {ingredient.id}
                              </span>
                            </div>
                          </td>
                          <td style={{ textAlign: 'center', fontWeight: '600' }}>{ingredient.unit}</td>
                          <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
                            {formatDisplayNumber(ingredient.currentStock)} {ingredient.unit}
                          </td>
                          <td>
                            <input
                              type="text"
                              inputMode="decimal"
                              value={row.actualStock}
                              onChange={(e) =>
                                handleCountRowChange(ingredient.id, 'actualStock', e.target.value)
                              }
                              disabled={isSubmitting}
                              className="form-control"
                              style={buildInputStyle(Boolean(rowError))}
                            />
                            {rowError && (
                              <div style={{ color: 'var(--color-error)', fontSize: '12px', marginTop: '6px' }}>
                                {rowError}
                              </div>
                            )}
                          </td>
                          <td
                            style={{
                              textAlign: 'right',
                              fontWeight: '700',
                              color:
                                differenceQuantity > 0
                                  ? 'var(--color-tertiary-container)'
                                  : differenceQuantity < 0
                                    ? 'var(--color-error)'
                                    : 'var(--color-secondary)',
                              fontVariantNumeric: 'tabular-nums',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {differenceQuantity > 0 ? '+' : ''}
                            {formatDisplayNumber(differenceQuantity)} {ingredient.unit}
                          </td>
                          <td>
                            <input
                              type="text"
                              value={row.note}
                              onChange={(e) =>
                                handleCountRowChange(ingredient.id, 'note', e.target.value)
                              }
                              placeholder="Ví dụ: đổ vỡ, thất thoát, kiểm kê thừa..."
                              disabled={isSubmitting}
                              className="form-control"
                            />
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                type="submit"
                variant="primary"
                loading={isSubmitting}
                icon={<ClipboardCheck size={16} />}
                disabled={isLoading || isImportingFile}
              >
                Ghi nhận kiểm kê ngày
              </Button>
            </div>
          </form>
        )}
      </div>

      <Toast message={toastMsg} type={toastType} onClose={() => setToastMsg('')} />
    </div>
  );
}

export default StockPage;
