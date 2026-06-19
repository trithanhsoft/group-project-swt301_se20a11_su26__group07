import React from 'react';

export function StatusBadge({ status, customLabel }) {
  let label = customLabel || status;
  let variant = 'neutral';

  const s = String(status).toUpperCase();
  if (s === 'ACTIVE' || s === 'CON_HANG' || s === 'IN_STOCK' || s === 'SUCCESS' || s === 'ĐÃ THIẾT LẬP') {
    variant = 'success';
    if (!customLabel) {
      if (s === 'ACTIVE') label = 'Hoạt động';
      else if (s === 'CON_HANG' || s === 'IN_STOCK') label = 'Còn hàng';
      else if (s === 'SUCCESS') label = 'Thành công';
    }
  } else if (s === 'INACTIVE' || s === 'HET_HANG' || s === 'OUT_OF_STOCK' || s === 'ERROR' || s === 'FAILED' || s === 'CHƯA THIẾT LẬP') {
    variant = 'error';
    if (!customLabel) {
      if (s === 'INACTIVE') label = 'Ngưng hoạt động';
      else if (s === 'HET_HANG' || s === 'OUT_OF_STOCK') label = 'Hết hàng';
      else if (s === 'ERROR' || s === 'FAILED') label = 'Thất bại';
    }
  } else if (s === 'LOW_STOCK' || s === 'SAP_HET' || s === 'WARNING') {
    variant = 'warning';
    if (!customLabel) {
      if (s === 'LOW_STOCK' || s === 'SAP_HET') label = 'Sắp hết hàng';
      else if (s === 'WARNING') label = 'Cảnh báo';
    }
  }

  return (
    <span className={`badge badge-${variant}`}>
      {label}
    </span>
  );
}
export default StatusBadge;
