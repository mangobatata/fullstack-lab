import { defineHandler } from "nitro";
import { getRouterParam } from "nitro/h3";
import { HTTPError } from "nitro";
import { pool } from "../../utils/db";
import { toProduct } from "../../utils/products.ts";

export default defineHandler(async (event) => {
  const slug = getRouterParam(event, "slug");

  if (!slug) {
    throw new HTTPError({
      status: 400,
      statusText: "Bad Request",
      message: "El parámetro slug es requerido.",
    });
  }

  const product = await pool.query(
    "SELECT id, name, price, quantity, slug FROM products WHERE slug = $1",
    [slug],
  );

  if (product.rows.length === 0) {
    throw new HTTPError({
      status: 404,
      statusText: "Not Found",
      message: `El producto con el slug "${slug}" no existe.`,
    });
  }

  return toProduct(product.rows[0]);
});
