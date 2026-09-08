import { defineHandler } from "nitro";
import { getRouterParam } from "nitro/h3";
import { HTTPError } from "nitro";
import { pool } from "#server/utils/db.ts";

// Nitro ejecuta esta función al recibir DELETE /api/products/:slug.
export default defineHandler(async (event) => {
  // Leemos el slug de la URL para saber qué producto eliminar.
  const slug = getRouterParam(event, "slug");

  if (!slug || slug.trim() === "") {
    throw new HTTPError({
      status: 400,
      statusText: "Bad Request",
      message: "El parámetro slug es requerido.",
    });
  }

  // WHERE limita el borrado al producto indicado. Sin WHERE borraríamos todos.
  // $1 recibe el valor del array [slug], separado del texto SQL.
  const result = await pool.query(
    "DELETE FROM products WHERE slug = $1;",
    [slug],
  );

  // rowCount indica cuántas filas se borraron. Cero significa que no existía.
  if (result.rowCount === 0) {
    throw new HTTPError({
      status: 404,
      statusText: "Not Found",
      message: `El producto con el slug "${slug}" no existe.`,
    });
  }

  // 204 confirma que se completó el borrado y no lleva un cuerpo de respuesta.
  event.res.status = 204;
  return null;
});
