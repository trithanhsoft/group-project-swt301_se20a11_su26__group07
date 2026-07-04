import { query } from '../../config/db.js';

async function countRows(sql, params = []) {
  const result = await query(sql, params);
  return Number(result.rows[0]?.count || 0);
}

export async function getSummary() {
  const today = new Date().toISOString().slice(0, 10);

  const [
    products,
    ingredients,
    orders,
    lowStockIngredients,
    pendingRequests,
    revenueResult,
    recentOrdersResult,
    lowStockListResult,
    weeklyRevenueResult
  ] = await Promise.all([
    countRows('select count(*)::int as count from products where deleted_at is null'),
    countRows('select count(*)::int as count from ingredients where deleted_at is null'),
    countRows("select count(*)::int as count from orders where status = 'SUCCESS'"),
    countRows('select count(*)::int as count from v_low_stock_ingredients'),
    countRows("select count(*)::int as count from staff_requests where status = 'PENDING'"),
    query(
      `select coalesce(total_revenue, 0)::numeric as total_revenue, coalesce(total_orders, 0)::int as total_orders
       from v_daily_revenue
       where order_date = $1
       limit 1`,
      [today],
    ),
    query(
      `select id, order_code, total_amount, created_at, status
       from orders
       where status = 'SUCCESS'
       order by created_at desc
       limit 5`
    ),
    query(
      `select name, current_stock, low_stock_threshold, unit
       from v_low_stock_ingredients
       order by current_stock asc
       limit 5`
    ),
    query(
      `select order_date::text as order_date, coalesce(total_revenue, 0)::numeric as total_revenue
       from v_daily_revenue
       order by order_date desc
       limit 7`
    )
  ]);

  const revenueToday = revenueResult.rows[0] || { total_revenue: 0, total_orders: 0 };
  const weeklyRevenue = weeklyRevenueResult.rows.reverse();

  return {
    counts: {
      products,
      ingredients,
      orders,
      lowStockIngredients,
      pendingRequests,
    },
    today: {
      revenue: Number(revenueToday.total_revenue || 0),
      orders: Number(revenueToday.total_orders || 0),
    },
    recentOrders: recentOrdersResult.rows || [],
    lowStockList: lowStockListResult.rows || [],
    weeklyRevenue: weeklyRevenue || [],
  };
}
