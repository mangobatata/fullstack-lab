import { defineHandler } from "nitro";
import { readBody } from "nitro/h3";
import { HTTPError } from "nitro";
import { pool } from "#server/utils/db.ts";
import { toProduct } from "#server/utils/products.ts";
import { ProductInput } from "../../../types/products";

export default defineHandler(async (event) => {
  const body = await readBody<ProductInput>(event);

  if (!body) {
    throw new HTTPError({
      status: 400,
      statusText: "Bad Request",
      message: "El body es requerido.",
    });
  }

  const { name, price, quantity, slug } = body;

  if (!name || typeof name !== "string" || name.trim() === "") {
    throw new HTTPError({
      status: 400, // Bad Request
      statusText: "Bad Request",
      message: "El campo 'name' es requerido y debe ser un texto válido.",
    });
  }

  if (price === undefined || typeof price !== "number" || price < 0) {
    throw new HTTPError({
      status: 400, // Bad Request
      statusText: "Bad Request",
      message: "El campo 'price' es requerido y debe ser un texto válido.",
    });
  }

  if (quantity === undefined || typeof quantity !== "number" || quantity < 0) {
    throw new HTTPError({
      status: 400, // Bad Request
      statusText: "Bad Request",
      message: "El campo 'quantity' es requerido y debe ser un texto válido.",
    });
  }

  if (!slug || typeof slug !== "string" || slug.trim() === "") {
    throw new HTTPError({
      status: 400, // Bad Request
      statusText: "Bad Request",
      message: "El campo 'slug' es requerido y debe ser un texto válido.",
    });
  }

  // 2. Intento de inserción seguro en la base de datos
  try {
    const result = await pool.query(
      `INSERT INTO products (name, price, quantity, slug) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *;`,
      [name, price, quantity, slug],
    );

    const newProduct = toProduct(result.rows[0]);

    event.res.status = 201;
    return newProduct;
  } catch (error: any) {
    // Código de error nativo de Postgres para violaciones de restricciones UNIQUE (23505)
    if (error.code === "23505") {
      throw new HTTPError({
        status: 409,
        statusText: "Conflict",
        message: `El slug '${slug}' ya está siendo utilizado por otro producto.`,
      });
    }

    throw error;
  }
});
