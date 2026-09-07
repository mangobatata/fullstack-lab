import { defineHandler } from "nitro";
import { pool } from "#server/utils/db.ts";
import { toProducts } from "#server/utils/products.ts";

export default defineHandler(async () => {
  const result = await pool.query(
    "SELECT id, name, price, quantity, slug FROM products ORDER BY id;",
  );
  return toProducts(result.rows);
});
