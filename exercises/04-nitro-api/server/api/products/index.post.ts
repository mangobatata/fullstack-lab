import { defineHandler, HTTPError } from "nitro";
import { readBody } from "nitro/h3";
import { products } from "#data/api.ts";
import type { CreateProductInput } from "#types/products.ts";

export default defineHandler(async (event) => {
  const newProduct = await readBody<CreateProductInput>(event);

  if (!newProduct) {
    throw new HTTPError({
      status: 400,
      statusText: "Bad Request",
      message: "El body es requerido.",
    });
  }

  const { name, price, quantity, slug } = newProduct;

  if (!slug || typeof slug !== "string" || slug.trim() === "") {
    throw new HTTPError({
      status: 400, // Bad Request
      statusText: "Bad Request",
      message: "El campo 'slug' es requerido y debe ser un texto válido.",
    });
  }

  if (!name || typeof name !== "string" || name.trim() === "") {
    throw new HTTPError({
      status: 400, // Bad Request
      statusText: "Bad Request",
      message: "El campo 'name' es requerido y debe ser un texto válido.",
    });
  }

  if (quantity === undefined || typeof quantity !== "number" || quantity < 0) {
    throw new HTTPError({
      status: 400,
      statusText: "Bad Request",
      message:
        "El campo 'quantity' es requerido y debe ser un número mayor o igual a cero.",
    });
  }

  if (price === undefined || typeof price !== "number" || price < 0) {
    throw new HTTPError({
      status: 400,
      statusText: "Bad Request",
      message:
        "El campo 'price' es requerido y debe ser un número mayor o igual a cero.",
    });
  }

  //    Validar que el slug no esté duplicado
  const slugExiste = products.some((p) => p.slug === slug);
  if (slugExiste) {
    throw new HTTPError({
      status: 409, // Conflict
      statusText: "Conflict",
      message: `El slug '${slug}' ya está siendo utilizado por otro producto.`,
    });
  }

  const productToInsert = {
    id: products.length + 1,
    name,
    price,
    quantity,
    slug,
  };

  // 3. Guardar en el array en memoria
  products.push(productToInsert);
  event.res.status = 201;

  return productToInsert;
});
