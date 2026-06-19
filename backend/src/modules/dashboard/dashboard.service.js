import { query } from '../../config/db.js';

async function countRows(sql, params = []) {
  const result = await query(sql, params);
  return Number(result.rows[0]?.count || 0);
}

export async function getSummary() {
  const today = new Date().toISOString().slice(0, 10);

  const [products, ingredients, orders, lowStockIngredients, revenueResult, lastOrderResult] = await Promise.all([
    countRows('select count(*)::int as count from products where deleted_at is null'),
    countRows('select count(*)::int as count from ingredients where deleted_at is null'),
    countRows("select count(*)::int as count from orders where status = 'SUCCESS'"),
    countRows('select count(*)::int as count from v_low_stock_ingredients'),
    query(
      `select coalesce(total_revenue, 0)::numeric as total_revenue, coalesce(total_orders, 0)::int as total_orders
       from v_daily_revenue
       where order_date = $1
       limit 1`,
      [today],
    ),
    query(
      `select order_code, total_amount, created_at
       from orders
       where status = 'SUCCESS'
       order by created_at desc
       limit 1`,
    ),
  ]);

  const revenueToday = revenueResult.rows[0] || { total_revenue: 0, total_orders: 0 };

  return {
    counts: {
      products,
      ingredients,
      orders,
      lowStockIngredients,
    },
    today: {
      revenue: Number(revenueToday.total_revenue || 0),
      orders: Number(revenueToday.total_orders || 0),
    },
    lastOrder: lastOrderResult.rows[0] || null,
  };
}
