import { defineHandler, HTTPError } from "nitro";
import { getRouterParam } from "nitro/h3";
import { products } from "#data/api.ts";

export default defineHandler((event) => {
  const slug = getRouterParam(event, "slug");

  if (!slug) {
    throw new HTTPError({
      status: 400,
      statusText: "Bad Request",
      message: "El parámetro slug es requerido.",
    });
  }

  const productIndex = products.findIndex((p) => p.slug === slug);

  if (productIndex === -1) {
    throw new HTTPError({
      status: 404,
      statusText: "Not Found",
      message: `El producto con el slug "${slug}" no existe y no pudo ser eliminado.`,
    });
  }

  // 1. Quirúrgico: Remover de la memoria
  products.splice(productIndex, 1);

  // 2. Semántica pura: Seteamos el estatus 204
  event.res.status = 204;
  event.res.statusText = "No Content";

  // 3. Nada más que decir: retornamos vacío
  return; 
});
