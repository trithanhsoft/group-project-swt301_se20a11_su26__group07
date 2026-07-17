import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();
const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  const tables = ['shifts', 'staff_availability', 'staff_shifts'];
  for (const table of tables) {
    const res = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = $1;
    `, [table]);
    console.log(`Table: ${table}`);
    res.rows.forEach(r => {
      console.log(`  - ${r.column_name} (${r.data_type})`);
    });
  }
  
  // Also query existing shifts to know their IDs and names
  const shiftsRes = await pool.query('SELECT id, name, start_time, end_time FROM public.shifts;');
  console.log('Existing shifts:');
  shiftsRes.rows.forEach(s => {
    console.log(`  - [${s.id}] ${s.name}: ${s.start_time} - ${s.end_time}`);
  });

  await pool.end();
}

run();
