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

  const product = products.find((p) => p.slug === slug);

  if (!product) {
    throw new HTTPError({
      status: 404,
      statusText: "Not Found",
      message: `El producto con el slug "${slug}" no existe.`,
    });
  }

  return product;
});
