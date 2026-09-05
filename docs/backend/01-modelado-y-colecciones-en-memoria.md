# 01 — Modelado de Datos y Colecciones en Memoria

## Objetivo
Aprender a definir contratos de datos con TypeScript (`interface`) y manipular colecciones en memoria que servirán como fuente de verdad antes de conectar una base de datos real.

---

## 1. Definición del Modelo (`interface`)

Modelamos un recurso `Product` con tipos primitivos estrictos:

```ts
export interface Product {
  name: string;
  price: number;
  quantity: number;
  stock: boolean;
}
```

- `name`: Identificador descriptivo legible (`string`).
- `price`: Valor monetario (`number`).
- `quantity`: Cantidad de unidades disponibles (`number`).
- `stock`: Bandera de disponibilidad inmediata (`boolean`).

---

## 2. Acceso a Colecciones vs. Iteración

Cuando una función necesita retornar una colección completa que ya reside en memoria, no requiere un bucle.

```text
┌───────────────────────────────────────────────┐
│ Memoria del Proceso (Array de Productos)      │
│ [ { Mouse }, { Teclado }, { Auriculares } ]   │
└───────────────────────┬───────────────────────┘
                        │
                        │ getProducts()
                        ▼
            Retorna la referencia/lista directamente
```

- **Iterar (`for`, `map`, `filter`):** Se usa para inspeccionar, transformar o filtrar elementos individuales.
- **Retorno directo (`return products`):** Se usa cuando la colección completa es el resultado deseado.

---

## Bitácora de Aprendizaje y Errores Reales

### Error 1: Retorno prematuro dentro de un bucle `for`
**Código inicial:**
```ts
function getProducts(products: Product[]) {
  for (let i = 0; i < products.length; i++) {
    return products;
  }
}
```
**Qué ocurrió:**
En la primera iteración (`i = 0`), la sentencia `return` interrumpe inmediatamente el bucle y sale de la función. El bucle nunca llega a una segunda iteración.

### Error 2: Condición inaccesible para listas vacías
**Código intentado:**
```ts
function getProducts(products: Product[]) {
  for (let i = 0; i < products.length; i++) {
    if (products.length === 0) {
      return [];
    }
    return products;
  }
}
```
**Qué ocurrió:**
Si `products` es un array vacío (`[]`), `products.length` es `0`. La condición de entrada al bucle `i < products.length` (`0 < 0`) evalúa a `false`. El flujo nunca entra al cuerpo del `for`, ignorando el `if` y devolviendo implícitamente `undefined`.

### Razonamiento y corrección final
Si el objetivo es entregar la colección completa (la "caja entera"), no es necesario recorrer elemento por elemento:
```ts
export function getProducts(products: Product[]): Product[] {
  return products;
}
```
