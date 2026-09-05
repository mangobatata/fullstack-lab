import type { Product } from "../01-modelado-productos";

export function findProductById(
  products: Product[],
  id: number,
): Product | undefined {
  return products.find((p) => p.id === id);
}

export function isValidQuantity(quantity: number): boolean {
  return Number.isFinite(quantity) && quantity >= 0;
}

export function isValidProductId(id: number): boolean {
  return Number.isInteger(id) && id > 0;
}

export function isValidPrice(price: number): boolean {
  return Number.isFinite(price) && price >= 0;
}

export function validateProductInput(input: Record<string, unknown>): string | null {
  if (typeof input.id !== "number" || !isValidProductId(input.id)) {
    return "id debe ser un entero positivo";
  }

  if (typeof input.name !== "string" || input.name.trim().length === 0) {
    return "name debe ser una cadena no vacía";
  }

  if (typeof input.price !== "number" || !isValidPrice(input.price)) {
    return "price debe ser un número mayor o igual a 0";
  }

  if (typeof input.quantity !== "number" || !isValidQuantity(input.quantity)) {
    return "quantity debe ser un número mayor o igual a 0";
  }

  if (typeof input.slug !== "string" || input.slug.trim().length === 0) {
    return "slug debe ser una cadena no vacía";
  }

  return null;
}
