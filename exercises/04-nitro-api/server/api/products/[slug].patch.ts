import { defineHandler, HTTPError } from "nitro";
import { getRouterParam, readBody } from "nitro/h3";
import { products } from "#data/api.ts";
import type { CreateProductInput } from "#types/products.ts";

export default defineHandler(async (event) => {
  // 1. Obtener slug de URL
  const slug = getRouterParam(event, "slug");

  if (!slug) {
    throw new HTTPError({
      status: 400,
      statusText: "Bad Request",
      message: "El parámetro slug es requerido.",
    });
  }

  // 2. Buscar producto
  const product = products.find((p) => p.slug === slug);

  // 3. ¿No existe? → 404
  if (!product) {
    throw new HTTPError({
      status: 404,
      statusText: "Not Found",
      message: `El producto con el slug "${slug}" no existe.`,
    });
  }

  // 4. Leer body como Parcial (cualquier campo puede faltar)
  const patchData = await readBody<Partial<CreateProductInput>>(event);

  if (!patchData || Object.keys(patchData).length === 0) {
    throw new HTTPError({
      status: 400,
      statusText: "Bad Request",
      message: "El body es requerido y no puede estar vacío.",
    });
  }

  const { name, price, quantity, slug: newSlug } = patchData;

  // 5. Validar datos condicionalmente (Guardianes !== undefined)

  if (newSlug !== undefined) {
    if (typeof newSlug !== "string" || newSlug.trim() === "") {
      throw new HTTPError({
        status: 400,
        statusText: "Bad Request",
        message: "El campo 'slug' provisto debe ser un texto válido.",
      });
    }

    // 6. Si cambia el slug: comprobar que no esté usado por OTRO producto
    const slugExiste = products.some(
      (p) => p.slug === newSlug && p.slug !== slug,
    );

    if (slugExiste) {
      throw new HTTPError({
        status: 409,
        statusText: "Conflict",
        message: `El slug '${newSlug}' ya está siendo utilizado por otro producto.`,
      });
    }
  }

  if (name !== undefined) {
    if (typeof name !== "string" || name.trim() === "") {
      throw new HTTPError({
        status: 400,
        statusText: "Bad Request",
        message: "El campo 'name' provisto debe ser un texto válido.",
      });
    }
  }

  if (quantity !== undefined) {
    if (typeof quantity !== "number" || quantity < 0) {
      throw new HTTPError({
        status: 400,
        statusText: "Bad Request",
        message:
          "El campo 'quantity' provisto debe ser un número mayor o igual a cero.",
      });
    }
  }

  if (price !== undefined) {
    if (typeof price !== "number" || price < 0) {
      throw new HTTPError({
        status: 400,
        statusText: "Bad Request",
        message:
          "El campo 'price' provisto debe ser un número mayor o igual a cero.",
      });
    }
  }

  // 7. Actualizar el producto existente (solo lo que vino)
  if (newSlug !== undefined) product.slug = newSlug;
  if (name !== undefined) product.name = name;
  if (price !== undefined) product.price = price;
  if (quantity !== undefined) product.quantity = quantity;

  // 8. Devolver producto actualizado
  return product;
});

// 1. Obtener slug de URL
//         ↓
// 2. Buscar producto
//         ↓
// 3. ¿No existe?
//    → 404
//         ↓
// 4. Leer body
//         ↓
// 5. Validar datos
//         ↓
// 6. Si cambia el slug:
//    comprobar que el nuevo slug no esté usado por OTRO producto
//         ↓
// 7. Actualizar el producto existente
//         ↓
// 8. Devolver producto actualizado
