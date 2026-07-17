import { query, pool } from "../config/db.js";

async function run() {
  console.log("Running Mid-Shift Check-in database migrations...");
  try {
    // Add columns to pos_sessions table
    console.log("Altering pos_sessions table to add mid-shift fields...");
    await query(`
      ALTER TABLE public.pos_sessions
      ADD COLUMN IF NOT EXISTS mid_shift_cash NUMERIC,
      ADD COLUMN IF NOT EXISTS mid_shift_counted_at TIMESTAMP WITH TIME ZONE,
      ADD COLUMN IF NOT EXISTS mid_shift_expected NUMERIC,
      ADD COLUMN IF NOT EXISTS mid_shift_discrepancy NUMERIC,
      ADD COLUMN IF NOT EXISTS mid_shift_notes TEXT;
    `);
    console.log("pos_sessions table updated successfully with mid-shift fields.");

  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await pool.end();
    console.log("Database pool closed.");
  }
}

run();
