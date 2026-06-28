export function formatVND(amount) {
  if (amount === undefined || amount === null || Number.isNaN(Number(amount))) {
    return '0 ₫';
  }

  const formatted = new Intl.NumberFormat('vi-VN').format(Number(amount));
  return `${formatted} ₫`;
}

export function parseVND(value) {
  if (!value) return 0;

  const normalized = String(value).replace(/[^\d]/g, '');
  const numberValue = parseInt(normalized, 10);

  return Number.isNaN(numberValue) ? 0 : numberValue;
}
