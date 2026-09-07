import { defineHandler } from "nitro";
import { getRouterParam } from "nitro/h3";
import { HTTPError } from "nitro";
import { pool } from "#server/utils/db.ts";
import { toProduct, type ProductRow } from "#server/utils/products.ts";

import { validateSlug } from "#server/utils/validation.ts";

// Busca por el identificador público; una colección vacía aquí significa 404.
export default defineHandler(async (event) => {
  const slug = validateSlug(getRouterParam(event, "slug"));

  const product = await pool.query<ProductRow>(
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
