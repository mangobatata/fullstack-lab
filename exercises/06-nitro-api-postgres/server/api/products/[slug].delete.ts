import { defineHandler, HTTPError } from "nitro";
import { getRouterParam } from "nitro/h3";
import { pool } from "#server/utils/db.ts";
import { validateSlug } from "#server/utils/validation.ts";

export default defineHandler(async (event) => {
  const slug = validateSlug(getRouterParam(event, "slug"));
  // DELETE informa cuántas filas eliminó; no necesitamos hacer SELECT antes.
  const result = await pool.query("DELETE FROM products WHERE slug = $1;", [slug]);
  if (result.rowCount === 0) {
    throw new HTTPError({ status: 404, message: "El producto no existe." });
  }
  // 204 confirma el borrado y no incluye cuerpo en la respuesta.
  event.res.status = 204;
  return null;
});
