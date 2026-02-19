import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import dotenv from "dotenv";
dotenv.config();
const pool = new Pool({
  connectionString: process.env.POSTGRES_DATABASE_URL,
});

// Test connection and log status
pool
  .connect()
  .then((client) => {
    console.log("✅ Database connected successfully");
    client.release(); // release the test client back to pool
  })
  .catch((err) => {
    console.error("❌ Database connection failed:", err.message);
  });

// Initialize Drizzle ORM
export const db = drizzle(pool);
export default db;
