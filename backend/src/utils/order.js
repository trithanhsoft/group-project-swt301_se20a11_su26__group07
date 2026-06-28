function toPublicOrderItem(row) {
  return {
    id: row.id,
    orderId: row.order_id,
    productId: row.product_id,
    productName: row.product_name_snapshot,
    quantity: Number(row.quantity || 0),
    unitPrice: Number(row.unit_price || 0),
    subtotal: Number(row.subtotal || 0),
    createdAt: row.created_at || null,
  };
}

export function toPublicOrder(row, itemRows = []) {
  if (!row) return null;

  return {
    id: row.id,
    orderId: row.id,
    orderCode: row.order_code,
    staffId: row.staff_id,
    staffUsername: row.staff_username || null,
    totalAmount: Number(row.total_amount || 0),
    paymentMethod: row.payment_method || 'CASH',
    amountReceived:
      row.amount_received === undefined || row.amount_received === null
        ? null
        : Number(row.amount_received),
    changeAmount:
      row.change_amount === undefined || row.change_amount === null
        ? null
        : Number(row.change_amount),
    paidAt: row.paid_at || null,
    status: row.status,
    kdsStatus: row.kds_status || 'COMPLETED',
    kdsCompletedAt: row.kds_completed_at || null,
    kdsCompletedBy: row.kds_completed_by || null,
    note: row.note || '',
    createdAt: row.created_at || null,
    updatedAt: row.updated_at || null,
    items: itemRows.map(toPublicOrderItem),
  };
}
