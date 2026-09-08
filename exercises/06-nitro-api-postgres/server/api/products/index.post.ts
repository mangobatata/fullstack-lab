import { defineHandler } from "nitro";
import { readBody } from "nitro/h3";
import { HTTPError } from "nitro";
import { pool } from "#server/utils/db.ts";
import { toProduct } from "#server/utils/products.ts";
import { generateSlug } from "#server/utils/slug.ts";
import { ProductInput } from "../../../types/products";

// Omitimos el slug del input del body ya que se generará de forma automática
type CreateProductInput = Omit<ProductInput, "slug">;

// Nitro llama a esta función cuando llega una petición. event contiene sus datos.
export default defineHandler(async (event) => {
  // Leemos el JSON. El tipo de TypeScript no comprueba los datos al ejecutar.
  const body = await readBody<CreateProductInput>(event);

  if (!body) {
    throw new HTTPError({
      status: 400,
      statusText: "Bad Request",
      message: "El body es requerido.",
    });
  }

  // Extraemos los campos del objeto para usarlos por separado.
  const { name, price, quantity } = body;

  if (!name || typeof name !== "string" || name.trim() === "") {
    throw new HTTPError({
      status: 400,
      statusText: "Bad Request",
      message: "El campo 'name' es requerido y debe ser un texto válido.",
    });
  }

  if (price === undefined || typeof price !== "number" || price < 0) {
    throw new HTTPError({
      status: 400,
      statusText: "Bad Request",
      message:
        "El campo 'price' es requerido y debe ser un número válido igual o mayor a 0.",
    });
  }

  if (quantity === undefined || typeof quantity !== "number" || quantity < 0) {
    throw new HTTPError({
      status: 400,
      statusText: "Bad Request",
      message:
        "El campo 'quantity' es requerido y debe ser un número válido igual o mayor a 0.",
    });
  }

  // 1. Generación automática del slug: uuidId6-nombre-limpio.
  // El cliente nunca manda el slug; nace en el servidor.
  const generatedSlug = generateSlug(name);

  // 2. Intento de inserción seguro en la base de datos
  try {
    const result = await pool.query(
      `INSERT INTO products (name, price, quantity, slug) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *;`,
      [name, price, quantity, generatedSlug],
    );

    const newProduct = toProduct(result.rows[0]);

    // 201 significa que se creó un producto.
    event.res.status = 201;
    return newProduct;
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

// Comprobamos que exista code antes de leerlo. 23505 indica un valor duplicado.
function isDbError(error: unknown): error is { code: string } {
  return typeof error === "object" && error !== null && "code" in error;
}
