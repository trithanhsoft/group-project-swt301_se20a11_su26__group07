export function formatVND(amount) {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '0 ₫';
  }
  // format number with dot separator: e.g. 25.000 ₫
  const formatted = new Intl.NumberFormat('vi-VN').format(amount);
  return `${formatted} ₫`;
}

export function parseVND(str) {
  if (!str) return 0;
  const normalized = String(str).replace(/[^\d]/g, '');
  const num = parseInt(normalized, 10);
  return isNaN(num) ? 0 : num;
}
