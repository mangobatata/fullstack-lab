import { HTTPError } from "nitro";
import type { ProductInput } from "#types/products.ts";

// Esta lista fija también determina las únicas columnas actualizables.
export const productFields = ["name", "price", "quantity"] as const;

function badRequest(message: string): never {
  throw new HTTPError({ status: 400, message });
}

// Los tipos de TypeScript desaparecen al ejecutar: el JSON entra como unknown.
export function validateProduct(body: unknown, partial: false): ProductInput;
export function validateProduct(body: unknown, partial: true): Partial<ProductInput>;
export function validateProduct(body: unknown, partial: boolean): Partial<ProductInput> {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    badRequest("El body debe ser un objeto JSON.");
  }
  const input = body as Record<string, unknown>;
  const keys = Object.keys(input);
  if (keys.length === 0 || keys.some(key => !productFields.some(field => field === key))) {
    badRequest("Envía al menos un campo permitido: name, price o quantity.");
  }
  const result: Partial<ProductInput> = {};
  for (const field of productFields) {
    if (!Object.hasOwn(input, field)) {
      if (!partial) badRequest(`El campo '${field}' es requerido.`);
      continue; // PATCH conserva en la base los campos ausentes.
    }
    const value = input[field];
    if (field === "name") {
      if (typeof value !== "string" || value.trim() === "") {
        badRequest("name debe ser un texto no vacío.");
      }
      result.name = value.trim();
    } else if (field === "quantity") {
      // INT de PostgreSQL admite enteros con signo de 32 bits; el stock no es negativo.
      if (typeof value !== "number" || !Number.isInteger(value) || value < 0 || value > 2147483647) {
        badRequest("quantity debe ser un entero entre 0 y 2147483647.");
      }
      result.quantity = value;
    } else {
      // NUMERIC(10,2): ocho dígitos enteros y dos decimales.
      // toFixed permite comparar sin rechazar 0.29 por el error binario de multiplicar por 100.
      if (typeof value !== "number" || !Number.isFinite(value) || value < 0 || value > 99999999.99 || Number(value.toFixed(2)) !== value) {
        badRequest("price debe estar entre 0 y 99999999.99 y tener como máximo dos decimales.");
      }
      result.price = value;
    }
  }
  return result;
}

// No normalizamos el identificador: buscamos exactamente el slug de la URL.
export function validateSlug(slug: string | undefined): string {
  if (!slug || slug.trim() === "") badRequest("El parámetro slug es requerido.");
  return slug;
}
