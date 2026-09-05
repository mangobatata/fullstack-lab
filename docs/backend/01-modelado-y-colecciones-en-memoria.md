# 01 — Modelado de Datos y Colecciones en Memoria

## Objetivo
Aprender a definir contratos de datos con TypeScript (`interface`) y manipular colecciones en memoria que servirán como fuente de verdad antes de conectar una base de datos real.

---

## 1. Definición del Modelo (`interface`)

Modelamos un recurso `Product` con tipos primitivos estrictos:

```ts
export interface Product {
  id: number;
  name: string;
  price: number;
  quantity: number;
  slug: string;
}
```

- `id`: Identificador numérico único de la entidad (Primary Key técnica para backend/BD).
- `name`: Nombre descriptivo legible para humanos.
- `price`: Valor monetario (`number`).
- `quantity`: Cantidad de unidades disponibles en inventario (`number`).
- `slug`: Cadena de texto amigable para URLs limpias y legibles en el navegador (ej: `/productos/wireless-mouse`).

### Invariante de disponibilidad

`stock` representa una consecuencia de `quantity`, por lo que ambos campos deben mantenerse coherentes:

```text
quantity > 0  ───────►  stock = true
quantity = 0  ───────►  stock = false
```

Si `quantity` y `stock` se modifican por separado, el cliente puede recibir información contradictoria. La decisión de este ejercicio es conservar únicamente `quantity` como fuente de verdad y calcular `stock` cuando sea necesario exponerlo:

```text
Producto almacenado ── quantity ──► stock calculado ──► Respuesta al cliente
```

Así no existen dos valores persistidos que puedan quedar desalineados.

### Modelo interno vs. respuesta al cliente

Una transformación con `map` crearía nuevos objetos para una respuesta, pero no es obligatoria si `stock` puede calcularse al serializar o directamente en el cliente:

```text
Modelo interno:  Product { quantity }
                         │
                         └── stock = quantity > 0 (valor derivado)
```

No debemos mutar cada producto para agregar `stock`: eso duplicaría información y volvería a introducir el riesgo de desalineación. Si la API decide incluirlo en su contrato, puede calcularlo justo al construir la respuesta; si no lo incluye, el cliente puede derivarlo localmente.

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

### Error 3: Mezclar búsqueda, disponibilidad y retorno prematuro

En un intento de calcular disponibilidad se propuso:

```ts
function getProductByQuantity(products: Product[]) {
  for (let i = 0; i < products.length; i++) {
    if (products[i].quantity === 0) {
      return;
    }
    return products[i].name;
  }
}
```

El nombre y el parámetro representan una colección, pero el retorno ocurre en la primera iteración. Además, el resultado es el nombre del producto, no su disponibilidad, y el caso `quantity === 0` devuelve `undefined` sin expresar qué significa.

### Error 4: Usar `filter` cuando se necesita disponibilidad individual

Luego se propuso filtrar la colección según `quantity`:

```ts
function getProductByQuantity(products: Product[]) {
  return products.filter((p) => {
    if (p.quantity != 0) {
      return p;
    }
  });
}
```

Esta función devuelve una nueva colección de productos disponibles; no devuelve un `boolean` para un producto individual. En un `filter`, el callback debe expresar directamente si cada elemento pasa el filtro, y las comparaciones deben ser estrictas (`!==`).

### Error 5: Devolver un número como predicado

Se intentó devolver `p.quantity` desde el callback de `filter`. JavaScript interpreta números distintos de cero como truthy y `0` como falsy, por lo que el código puede parecer funcionar, pero oculta la regla del dominio. La disponibilidad debe expresarse como una comparación booleana (`quantity > 0`), que además excluye cantidades negativas.

### Diseño 1: Separar búsqueda y mensaje de error

Al buscar por `slug`, el modelo o servicio de datos debe devolver el producto encontrado o una ausencia (`undefined`). El mensaje para el usuario pertenece a la capa que presenta el resultado, por ejemplo un handler HTTP. Esto mantiene la función reutilizable y evita mezclar datos con mensajes de presentación.

La respuesta HTTP se decide después de ejecutar la búsqueda:

```text
findProductBySlug()
        │
        ├── Product encontrado ──► respuesta HTTP 200
        └── undefined ───────────► respuesta HTTP 404 + mensaje
```

Para una solicitud `GET /products/:slug`, el estado `404 Not Found` indica que el recurso solicitado no existe. No significa que el servidor haya fallado; significa que la búsqueda se ejecutó correctamente y no encontró coincidencias.

Cuando el producto sí existe, el contrato exitoso es `200 OK` con el producto encontrado en el body, serializado como JSON.

### Error 9: No retornar el resultado y mezclar capas

Una función de búsqueda puede comprobar si encontró datos, pero debe retornar el `Product` o `undefined`. Imprimir `200 OK` o `404 Not Found` dentro de ella mezcla la lógica de datos con la capa HTTP y, además, si no se ejecuta ningún `return`, la función termina devolviendo `undefined` implícitamente.

### Error 10: Envolver una comparación booleana sin necesidad

La expresión `p.slug === slug` ya devuelve `true` o `false`. Guardarla en `data` y retornar `undefined` cuando es falsa hace más difícil leer la función y no aporta comportamiento adicional. `find` puede recibir directamente esa comparación como predicado.

Para buscar un único producto se usa `find`, cuyo resultado es `Product | undefined`. `filter` se reserva para obtener una colección, aunque tenga cero, uno o varios elementos.

Implementación aplicada:

```ts
export function findProductBySlug(
  products: Product[],
  slug: string,
): Product | undefined {
  return products.find((product) => product.slug === slug);
}
```

Contrato esperado:

```text
slug existente ─────► Product
slug inexistente ───► undefined
```

### Error 6: Devolver datos en vez de un predicado booleano

En el callback de `find` se intentó devolver `undefined` cuando no había coincidencia y `p.slug` cuando sí la había. Aunque un string no vacío es truthy y puede hacer que parezca funcionar, el callback debe expresar una condición booleana: cada producto coincide o no coincide con el `slug` buscado.

### Error 7: Comprobar existencia en lugar de coincidencia

Después se comprobó `p.slug !== undefined`. Esa expresión solo verifica que el producto tenga un slug, no que sea igual al slug solicitado. Como todos los productos válidos tienen esa propiedad, `find` devolvería siempre el primer elemento. La búsqueda necesita comparar `p.slug` con el parámetro `slug`.

### Error 8: Comprobación redundante de una propiedad obligatoria

La interfaz declara `slug: string`, por lo que un `Product` válido siempre debe tener esa propiedad. Comprobar `p.slug !== undefined` no aporta información y hace que el callback pueda devolver `undefined`; la comparación `p.slug === slug` ya produce directamente el booleano requerido.
