import { defineHandler } from "nitro";
import { pool } from "#server/utils/db.ts";
import { toProducts, type ProductRow } from "#server/utils/products.ts";

export default defineHandler(async () => {
  // ORDER BY hace determinista el listado; sin filas devolvemos un array vacío.
  const result = await pool.query<ProductRow>(
    "SELECT id, name, price, quantity, slug FROM products ORDER BY id;",
  );
  return toProducts(result.rows);
});
