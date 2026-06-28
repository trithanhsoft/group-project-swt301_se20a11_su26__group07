import { DEFAULT_PRODUCT_TAG } from './tagTaxonomy.js';

export function toPublicProduct(row) {
  if (!row) return null;

  return {
    id: row.id,
    name: row.name,
    tag: row.tag || DEFAULT_PRODUCT_TAG,
    price: Number(row.price || 0),
    status: row.status,
    hasRecipe: Boolean(row.has_recipe),
    createdAt: row.created_at || null,
    updatedAt: row.updated_at || null,
  };
}
