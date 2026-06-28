export function StatusBadge({ status, customLabel }) {
  let label = customLabel || status;
  let variant = 'neutral';

  const normalizedStatus = String(status).toUpperCase();

  if (
    normalizedStatus === 'ACTIVE' ||
    normalizedStatus === 'CON_HANG' ||
    normalizedStatus === 'IN_STOCK' ||
    normalizedStatus === 'SUCCESS'
  ) {
    variant = 'success';

    if (!customLabel) {
      if (normalizedStatus === 'ACTIVE') label = 'Hoạt động';
      else if (normalizedStatus === 'CON_HANG' || normalizedStatus === 'IN_STOCK') label = 'Còn hàng';
      else if (normalizedStatus === 'SUCCESS') label = 'Thành công';
    }
  } else if (
    normalizedStatus === 'INACTIVE' ||
    normalizedStatus === 'HET_HANG' ||
    normalizedStatus === 'OUT_OF_STOCK' ||
    normalizedStatus === 'ERROR' ||
    normalizedStatus === 'FAILED'
  ) {
    variant = 'error';

    if (!customLabel) {
      if (normalizedStatus === 'INACTIVE') label = 'Ngưng hoạt động';
      else if (normalizedStatus === 'HET_HANG' || normalizedStatus === 'OUT_OF_STOCK') label = 'Hết hàng';
      else if (normalizedStatus === 'ERROR' || normalizedStatus === 'FAILED') label = 'Thất bại';
    }
  } else if (
    normalizedStatus === 'LOW_STOCK' ||
    normalizedStatus === 'SAP_HET' ||
    normalizedStatus === 'WARNING'
  ) {
    variant = 'warning';

    if (!customLabel) {
      if (normalizedStatus === 'LOW_STOCK' || normalizedStatus === 'SAP_HET') label = 'Sắp hết hàng';
      else if (normalizedStatus === 'WARNING') label = 'Cảnh báo';
    }
  }

  return <span className={`badge badge-${variant}`}>{label}</span>;
}

export default StatusBadge;
