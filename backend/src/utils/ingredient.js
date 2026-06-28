import { DEFAULT_INGREDIENT_TAG } from './tagTaxonomy.js';

export function toPublicIngredient(row) {
  if (!row) return null;

  const currentStock = Number(row.current_stock || 0);
  const lowStockThreshold = Number(row.low_stock_threshold || 0);

  return {
    id: row.id,
    name: row.name,
    tag: row.tag || DEFAULT_INGREDIENT_TAG,
    unit: row.unit,
    currentStock,
    lowStockThreshold,
    isLowStock:
      row.is_low_stock !== undefined
        ? Boolean(row.is_low_stock)
        : currentStock <= lowStockThreshold,
    createdAt: row.created_at || null,
    updatedAt: row.updated_at || null,
  };
}
