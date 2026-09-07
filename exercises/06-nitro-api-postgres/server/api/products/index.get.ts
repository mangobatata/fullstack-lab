import { defineHandler } from "nitro";
import { pool } from "../../utils/db";
import { toProducts } from "../../utils/products";

export default defineHandler(async () => {
  const result = await pool.query(
    "SELECT id, name, price, quantity, slug FROM products ORDER BY id;",
  );
  return toProducts(result.rows);
});
