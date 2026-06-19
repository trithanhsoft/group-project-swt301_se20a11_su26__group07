import dotenv from "dotenv";
import pg from "pg";
import path from "path";
import { fileURLToPath } from "url";

const { Pool } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendRoot = path.resolve(__dirname, "../..");

dotenv.config({
  path: path.join(backendRoot, ".env"),
  override: true,
});

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is missing. Please check backend/.env");
}

const dbUrl = new URL(process.env.DATABASE_URL);

// Xóa các sslmode trong URL để tránh pg tự verify certificate chain
dbUrl.searchParams.delete("sslmode");
dbUrl.searchParams.delete("sslrootcert");
dbUrl.searchParams.delete("sslcert");
dbUrl.searchParams.delete("sslkey");

console.log("[db] Using host:", dbUrl.hostname);
console.log("[db] Using database:", dbUrl.pathname.replace("/", ""));
console.log("[db] Using user:", decodeURIComponent(dbUrl.username));

export const pool = new Pool({
  connectionString: dbUrl.toString(),
  ssl: {
    rejectUnauthorized: false,
  },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 15000,
});

export async function query(text, params = []) {
  return pool.query(text, params);
}

export async function testConnection() {
  const result = await query("select now() as current_time");
  return result.rows[0];
}