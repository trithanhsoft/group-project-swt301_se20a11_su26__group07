import { query } from "../src/config/db.js";

async function run() {
  try {
    console.log("Altering app_users table to add reset_token columns...");
    await query(`
      ALTER TABLE app_users 
      ADD COLUMN IF NOT EXISTS reset_token TEXT,
      ADD COLUMN IF NOT EXISTS reset_token_expires_at TIMESTAMP WITH TIME ZONE;
    `);
    console.log("Table altered successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Failed to alter table:", error);
    process.exit(1);
  }
}

run();
