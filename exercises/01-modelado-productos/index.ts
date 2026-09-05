// Ejercicio 01 — Modelado de Productos en TypeScript
// Ejecutar con: bun run exercises/01-modelado-productos/index.ts

// 1. Definir el tipo o interfaz de un Producto aquí:
export interface Product {
  name: string;
  price: number;
  quantity: number;
  stock: boolean;
}

// 2. Crear una lista de productos en memoria:
export const products: Product[] = [
  {
    name: "Wireless Mouse",
    price: 29.99,
    quantity: 15,
    stock: true,
  },
  {
    name: "Mechanical Keyboard",
    price: 89.5,
    quantity: 0,
    stock: false,
  },
  {
    name: "Gaming Headset",
    price: 59.9,
    quantity: 8,
    stock: true,
  },
];

// 3. Crear una función para obtener todos los productos:
export function getProducts(products: Product[]): Product[] {
  return products;
}

// 4. Probar la función e imprimir el resultado por consola:
console.log(getProducts(products));
