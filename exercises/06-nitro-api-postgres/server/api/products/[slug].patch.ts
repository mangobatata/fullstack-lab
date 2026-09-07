import { defineHandler } from "nitro";
import { getRouterParam, readBody } from "nitro/h3";
import { HTTPError } from "nitro";
import { pool } from "#server/utils/db.ts";
import { toProduct } from "#server/utils/products.ts";
import { generateSlug } from "#server/utils/slug.ts";
import { ProductInput } from "../../../types/products";

// Omitimos el slug ya que el usuario no puede ni debe enviarlo en el body
type UpdateProductInput = Partial<Omit<ProductInput, "slug">>;

export default defineHandler(async (event) => {
  const slug = getRouterParam(event, "slug");

  if (!slug || typeof slug !== "string" || slug.trim() === "") {
    throw new HTTPError({
      status: 400,
      statusText: "Bad Request",
      message: "El parámetro 'slug' en la URL es requerido.",
    });
  }

  const body = await readBody<UpdateProductInput>(event);

  if (!body || Object.keys(body).length === 0) {
    throw new HTTPError({
      status: 400,
      statusText: "Bad Request",
      message:
        "El body es requerido y debe contener al menos un campo para actualizar.",
    });
  }

  const { name, price, quantity } = body;

  // 1. Validaciones parciales y dinámicas
  if (name !== undefined && (typeof name !== "string" || name.trim() === "")) {
    throw new HTTPError({
      status: 400,
      statusText: "Bad Request",
      message: "El campo 'name' debe ser un texto válido.",
    });
  }

  if (price !== undefined && (typeof price !== "number" || price < 0)) {
    throw new HTTPError({
      status: 400,
      statusText: "Bad Request",
      message: "El campo 'price' debe ser un número válido mayor o igual a 0.",
    });
  }

  if (
    quantity !== undefined &&
    (typeof quantity !== "number" || quantity < 0)
  ) {
    throw new HTTPError({
      status: 400,
      statusText: "Bad Request",
      message:
        "El campo 'quantity' debe ser un número válido mayor o igual a 0.",
    });
  }

  // 2. El UPDATE con RETURNING nos dice si existía:
  // si no trae filas, el slug no existe → 404.

  // 3. El slug solo cambia si cambia el nombre.
  // Si no vino name, el apodo público se queda quieto.
  let generatedSlug: string | undefined;
  if (name !== undefined) {
    generatedSlug = generateSlug(name);
  }

  // 4. Construcción Dinámica de la Consulta SQL 🛠️
  const setParts: string[] = [];
  const queryValues: any[] = [];
  let paramIndex = 1;

  if (name !== undefined) {
    setParts.push(`name = $${paramIndex++}`);
    queryValues.push(name);
  }
  if (price !== undefined) {
    setParts.push(`price = $${paramIndex++}`);
    queryValues.push(price);
  }
  if (quantity !== undefined) {
    setParts.push(`quantity = $${paramIndex++}`);
    queryValues.push(quantity);
  }

  // El slug solo se actualiza si vino un nombre nuevo
  if (generatedSlug !== undefined) {
    setParts.push(`slug = $${paramIndex++}`);
    queryValues.push(generatedSlug);
  }

  // El último parámetro es el slug original de la URL para el WHERE
  queryValues.push(slug);
  const whereIndex = paramIndex;

  const queryText = `
    UPDATE products 
    SET ${setParts.join(", ")} 
    WHERE slug = $${whereIndex} 
    RETURNING *;
  `;

  // 5. Ejecución de la actualización en la Base de Datos
  try {
    const result = await pool.query(queryText, queryValues);

    if (result.rows.length === 0) {
      throw new HTTPError({
        status: 404,
        statusText: "Not Found",
        message: `El producto con el slug '${slug}' no existe.`,
      });
    }

    return toProduct(result.rows[0]);
  } catch (error) {
    if (isDbError(error) && error.code === "23505") {
      throw new HTTPError({
        status: 409,
        statusText: "Conflict",
        message: `El slug generado automáticamente '${generatedSlug}' ya existe en el sistema.`,
      });
    }
    throw error;
  }
});

function isDbError(error: unknown): error is { code: string } {
  return typeof error === "object" && error !== null && "code" in error;
}
