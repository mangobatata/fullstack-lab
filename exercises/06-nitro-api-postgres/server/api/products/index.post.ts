import { defineHandler, HTTPError } from "nitro";
import { readBody } from "nitro/h3";
import { pool } from "#server/utils/db.ts";
import { toProduct, type ProductRow } from "#server/utils/products.ts";
import { generateSlug } from "#server/utils/slug.ts";
import { validateProduct } from "#server/utils/validation.ts";

export default defineHandler(async (event) => {
  // Validamos antes de usar una conexión; el genérico unknown no confía en el cliente.
  const { name, price, quantity } = validateProduct(await readBody<unknown>(event), false);
  try {
    // Los valores viajan separados del SQL. RETURNING evita otra consulta tras insertar.
    const result = await pool.query<ProductRow>(
      `INSERT INTO products (name, price, quantity, slug)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, price, quantity, slug;`,
      [name, price, quantity, generateSlug(name)],
    );
    event.res.status = 201;
    return toProduct(result.rows[0]);
  } catch (error) {
    // Una colisión no sobrescribe el producto existente. Otros errores siguen como 500.
    if (typeof error === "object" && error !== null && "code" in error && error.code === "23505") {
      throw new HTTPError({ status: 409, message: "El identificador generado ya existe. Intenta crear el producto de nuevo." });
    }
    throw error;
  }
});
