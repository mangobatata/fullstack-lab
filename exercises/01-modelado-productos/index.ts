// Ejercicio 01 — Modelado de Productos en TypeScript
// Ejecutar con: bun run exercises/01-modelado-productos/index.ts

// 1. Definir el tipo o interfaz de un Producto aquí:
export interface Product {
  id: number;
  name: string;
  price: number;
  quantity: number;
  slug: string;
}

// 2. Crear una lista de productos en memoria:
export const products: Product[] = [
  {
    id: 1,
    name: "Wireless Mouse",
    price: 29.99,
    quantity: 15,
    slug: "wireless-mouse",
  },
  {
    id: 2,
    name: "Mechanical Keyboard",
    price: 89.5,
    quantity: 0,
    slug: "mechanical-keyboard",
  },
  {
    id: 3,
    name: "Gaming Headset",
    price: 59.9,
    quantity: 8,
    slug: "gaming-headset",
  },
];

// 3. Crear una función para obtener todos los productos:
export function getProducts(products: Product[]): Product[] {
  return products;
}

// 4. Probar la función e imprimir el resultado por consola:
console.log(getProducts(products));

// 5. Obtener todos los productos cuyo quantity sea distinto de cero”
function getAvailableProducts(products: Product[]): Product[] {
  return products.filter((product) => product.quantity > 0);
}

console.log(getAvailableProducts(products));

// 6.
// Ahora escribe una función con esta forma:
// findProductBySlug(products, slug)
// Debe recibir la colección y el slug, y devolver el producto encontrado o undefined.
export function findProductBySlug(
  products: Product[],
  slug: string,
): Product | undefined {
  return products.find((p) => p.slug === slug);
}
console.log(findProductBySlug(products, "gaming-headset"));
