import { defineHandler } from "nitro";
import { getRouterParam } from "nitro/h3";
import { HTTPError } from "nitro";
import { pool } from "#server/utils/db.ts";
import { toProduct } from "#server/utils/products.ts";

// Nitro llama a esta función cuando llega una petición. event contiene sus datos.
export default defineHandler(async (event) => {
  // Obtenemos el identificador que viene en la URL.
  const slug = getRouterParam(event, "slug");

  if (!slug) {
    throw new HTTPError({
      status: 400,
      statusText: "Bad Request",
      message: "El parámetro slug es requerido.",
    });
  }

  // $1 recibe el slug del array. SELECT lee los datos de PostgreSQL.
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

  // rows contiene las filas. [0] obtiene la primera; toProduct convierte el precio.
  return toProduct(product.rows[0]);
});
