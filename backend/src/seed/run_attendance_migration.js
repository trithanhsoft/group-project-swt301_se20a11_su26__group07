import { query, pool } from "../config/db.js";

async function run() {
  console.log("Running attendance migration...");
  try {
    await query(`
      ALTER TABLE public.staff_shifts 
        ADD COLUMN IF NOT EXISTS check_in_at TIMESTAMP WITH TIME ZONE,
        ADD COLUMN IF NOT EXISTS check_out_at TIMESTAMP WITH TIME ZONE,
        ADD COLUMN IF NOT EXISTS lateness_minutes INTEGER DEFAULT 0,
        ADD COLUMN IF NOT EXISTS actual_hours NUMERIC DEFAULT 0;
    `);
    console.log("Attendance columns added successfully to staff_shifts table.");
  } catch (err) {
    console.error("Migration failed:", err.message || err);
  } finally {
    await pool.end();
  }
}

void run();
