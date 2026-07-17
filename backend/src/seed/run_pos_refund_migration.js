import { query, pool } from "../config/db.js";

async function run() {
  console.log("Running POS and Refund feature database migrations...");
  try {
    // 1. Drop views that depend on order_status or orders table
    console.log("Dropping existing views...");
    await query(`DROP VIEW IF EXISTS public.v_daily_revenue CASCADE;`);
    await query(`DROP VIEW IF EXISTS public.v_best_selling_products CASCADE;`);
    await query(`DROP VIEW IF EXISTS public.v_order_history CASCADE;`);

    // 2. Alter enums (Note: ALTER TYPE ADD VALUE cannot run inside a transaction block)
    console.log("Altering custom enum types...");
    try {
      await query(`ALTER TYPE public.order_status ADD VALUE IF NOT EXISTS 'REFUNDED';`);
      console.log("Added 'REFUNDED' to order_status enum.");
    } catch (e) {
      console.log("Note: Failed to add 'REFUNDED' to order_status (it might already exist):", e.message);
    }
    
    try {
      await query(`ALTER TYPE public.order_status ADD VALUE IF NOT EXISTS 'PARTIALLY_REFUNDED';`);
      console.log("Added 'PARTIALLY_REFUNDED' to order_status enum.");
    } catch (e) {
      console.log("Note: Failed to add 'PARTIALLY_REFUNDED' to order_status:", e.message);
    }

    try {
      await query(`ALTER TYPE public.stock_transaction_type ADD VALUE IF NOT EXISTS 'ORDER_REFUND';`);
      console.log("Added 'ORDER_REFUND' to stock_transaction_type enum.");
    } catch (e) {
      console.log("Note: Failed to add 'ORDER_REFUND' to stock_transaction_type:", e.message);
    }

    // 3. Create pos_sessions table
    console.log("Creating pos_sessions table...");
    await query(`
      CREATE TABLE IF NOT EXISTS public.pos_sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        staff_id UUID NOT NULL REFERENCES public.app_users(id),
        opened_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        closed_at TIMESTAMP WITH TIME ZONE,
        starting_cash NUMERIC NOT NULL DEFAULT 0,
        ending_cash_expected NUMERIC NOT NULL DEFAULT 0,
        ending_cash_actual NUMERIC,
        discrepancy NUMERIC,
        status VARCHAR(20) NOT NULL CHECK (status IN ('OPEN', 'CLOSED')) DEFAULT 'OPEN',
        is_overdue BOOLEAN DEFAULT false,
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
      );
    `);
    console.log("pos_sessions table created/verified.");

    // 4. Alter orders and order_items tables
    console.log("Altering orders and order_items tables...");
    await query(`
      ALTER TABLE public.orders 
        ADD COLUMN IF NOT EXISTS refunded_amount NUMERIC NOT NULL DEFAULT 0,
        ADD COLUMN IF NOT EXISTS pos_session_id UUID REFERENCES public.pos_sessions(id);
    `);
    
    await query(`
      ALTER TABLE public.order_items 
        ADD COLUMN IF NOT EXISTS refunded_quantity INTEGER NOT NULL DEFAULT 0;
    `);
    console.log("orders and order_items tables altered.");

    // 5. Recreate views
    console.log("Recreating views...");
    await query(`
      CREATE OR REPLACE VIEW public.v_daily_revenue AS
      SELECT date(created_at) AS order_date,
        count(id) AS total_orders,
        COALESCE(sum(total_amount - COALESCE(refunded_amount, 0)), (0)::numeric) AS total_revenue
      FROM public.orders o
      WHERE (status IN ('SUCCESS'::public.order_status, 'PARTIALLY_REFUNDED'::public.order_status))
      GROUP BY (date(created_at));
    `);

    await query(`
      CREATE OR REPLACE VIEW public.v_best_selling_products AS
      SELECT oi.product_id,
        oi.product_name_snapshot,
        sum(oi.quantity - COALESCE(oi.refunded_quantity, 0)) AS total_quantity,
        sum(oi.subtotal - (COALESCE(oi.refunded_quantity, 0) * oi.unit_price)) AS total_revenue
      FROM (public.order_items oi
        JOIN public.orders o ON ((o.id = oi.order_id)))
      WHERE (o.status IN ('SUCCESS'::public.order_status, 'PARTIALLY_REFUNDED'::public.order_status))
      GROUP BY oi.product_id, oi.product_name_snapshot;
    `);

    await query(`
      CREATE OR REPLACE VIEW public.v_order_history AS
      SELECT o.id,
        o.order_code,
        o.total_amount,
        o.status,
        o.created_at,
        u.full_name AS staff_name,
        count(oi.id) AS item_count
      FROM ((public.orders o
        LEFT JOIN public.app_users u ON ((u.id = o.staff_id)))
        LEFT JOIN public.order_items oi ON ((oi.order_id = o.id)))
      WHERE (o.status IN ('SUCCESS'::public.order_status, 'PARTIALLY_REFUNDED'::public.order_status, 'REFUNDED'::public.order_status))
      GROUP BY o.id, o.order_code, o.total_amount, o.status, o.created_at, u.full_name;
    `);

    console.log("All migrations run successfully.");
  } catch (err) {
    console.error("Migration failed:", err.message || err);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

void run();
