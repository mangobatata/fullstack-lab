import { pool } from "./db.ts";

const result = await pool.query(
  "SELECT id, name, price, quantity, slug FROM products ORDER BY id;",
);

console.log(result.rows);

await pool.end();
