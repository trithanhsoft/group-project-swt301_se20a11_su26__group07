import { query } from "../src/config/db.js";

async function run() {
  try {
    const result = await query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'app_users';
    `);
    console.log("Columns in app_users:");
    result.rows.forEach(r => console.log(`- ${r.column_name}: ${r.data_type}`));
    process.exit(0);
  } catch (error) {
    console.error("Failed to query columns:", error);
    process.exit(1);
  }
}

run();
