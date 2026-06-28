export function toPublicRecipe(row, items = []) {
  if (!row) return null;

  const normalizedItems = items.map((item) => ({
    ingredientId: item.ingredient_id,
    ingredientName: item.ingredient_name,
    unit: item.unit,
    quantity: Number(item.quantity_required || 0),
  }));

  return {
    id: row.id,
    productId: row.product_id,
    productName: row.product_name,
    productStatus: row.product_status,
    productPrice: Number(row.product_price || 0),
    itemCount: normalizedItems.length,
    items: normalizedItems,
    createdAt: row.created_at || null,
    updatedAt: row.updated_at || null,
  };
}
