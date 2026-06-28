import { parseStructuredStockNote } from './stockNote.js';

export function toPublicStockTransaction(row) {
  if (!row) return null;

  const noteMeta = parseStructuredStockNote(row.note || '');
  const transactionQuantity = Number(row.quantity || 0);
  const beforeStock = Number(row.before_stock || 0);
  const afterStock = Number(row.after_stock || 0);

  return {
    id: row.id,
    ingredientId: row.ingredient_id,
    ingredientName: row.ingredient_name,
    type: row.type,
    transactionQuantity,
    quantity: afterStock - beforeStock,
    beforeStock,
    afterStock,
    note: noteMeta.userNote,
    rawNote: noteMeta.rawNote,
    context: noteMeta.context,
    eventDate: noteMeta.eventDate,
    sessionCode: noteMeta.sessionCode,
    orderId: row.order_id || null,
    createdBy: row.created_by_username || null,
    createdAt: row.created_at || null,
  };
}
