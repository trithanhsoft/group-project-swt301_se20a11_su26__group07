import { query } from '../../config/db.js';

function toNumber(value) {
  return Number(value || 0);
}

function normalizePositiveInteger(value) {
  const normalizedValue = Number(value);

  if (!Number.isInteger(normalizedValue) || normalizedValue <= 0) {
    return null;
  }

  return normalizedValue;
}

export async function listRevenueReport({ dateFrom, dateTo } = {}) {
  const params = [];
  const conditions = [];

  if (dateFrom) {
    params.push(dateFrom);
    conditions.push(`order_date >= $${params.length}`);
  }

  if (dateTo) {
    params.push(dateTo);
    conditions.push(`order_date <= $${params.length}`);
  }

  const whereClause = conditions.length ? `where ${conditions.join(' and ')}` : '';

  const result = await query(
    `select order_date, total_orders, total_revenue
     from v_daily_revenue
     ${whereClause}
     order by order_date desc`,
    params,
  );

  return result.rows.map((row) => ({
    orderDate: row.order_date,
    totalOrders: toNumber(row.total_orders),
    totalRevenue: toNumber(row.total_revenue),
  }));
}

export async function listBestSellingProducts({ limit } = {}) {
  const normalizedLimit = normalizePositiveInteger(limit);
  const params = [];
  const limitClause = normalizedLimit ? `limit $1` : '';

  if (normalizedLimit) {
    params.push(normalizedLimit);
  }

  const result = await query(
    `select product_id, product_name_snapshot, total_quantity, total_revenue
     from v_best_selling_products
     order by total_quantity desc, total_revenue desc, product_name_snapshot asc
     ${limitClause}`,
    params,
  );

  return result.rows.map((row) => ({
    productId: row.product_id,
    productName: row.product_name_snapshot,
    quantitySold: toNumber(row.total_quantity),
    totalRevenue: toNumber(row.total_revenue),
  }));
}

export async function listLowStockIngredients() {
  const result = await query(
    `select id, name, unit, current_stock, low_stock_threshold, updated_at
     from v_low_stock_ingredients
     order by (low_stock_threshold - current_stock) desc, updated_at asc nulls last, name asc`,
  );

  return result.rows.map((row) => ({
    id: row.id,
    name: row.name,
    unit: row.unit,
    currentStock: toNumber(row.current_stock),
    lowStockThreshold: toNumber(row.low_stock_threshold),
    updatedAt: row.updated_at || null,
  }));
}
