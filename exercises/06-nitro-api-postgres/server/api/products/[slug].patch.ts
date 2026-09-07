import { defineHandler, HTTPError } from "nitro";
import { getRouterParam, readBody } from "nitro/h3";
import { pool } from "#server/utils/db.ts";
import { toProduct, type ProductRow } from "#server/utils/products.ts";
import { productFields, validateProduct, validateSlug } from "#server/utils/validation.ts";

export default defineHandler(async (event) => {
  const slug = validateSlug(getRouterParam(event, "slug"));
  const body = validateProduct(await readBody<unknown>(event), true);
  const setParts: string[] = [];
  const values: (string | number)[] = [];

  // Solo interpolamos nombres de columnas de nuestra lista fija, nunca claves del cliente.
  for (const field of productFields) {
    const value = body[field];
    if (value !== undefined) {
      values.push(value);
      setParts.push(`${field} = $${values.length}`);
    }
  }
  // La validación garantiza al menos un campo; el slug permanece estable al renombrar.
  values.push(slug);
  const result = await pool.query<ProductRow>(
    `UPDATE products SET ${setParts.join(", ")} WHERE slug = $${values.length}
     RETURNING id, name, price, quantity, slug;`,
    values,
  );
  // Una sola sentencia actualiza y comprueba existencia sin una lectura previa susceptible a carreras.
  if (result.rows.length === 0) {
    throw new HTTPError({ status: 404, message: "El producto no existe." });
  }
  return toProduct(result.rows[0]);
});
