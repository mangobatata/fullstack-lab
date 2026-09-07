# Algoritmos — API de productos (Nitro)

> **Regla común:** la colección (`products`) informa; el handler decide el resultado HTTP.
>
> **Éxito:** retornar recurso/datos.
> **Error:** retornar `status + mensaje`.

---

## GET `/api/products` → `index.get.ts`

```text
ALGORITMO OBTENER_TODOS_LOS_PRODUCTOS

    RETORNAR products

FIN
```

**Flujo:**

```text
products
   ↓
RETORNAR colección
   ↓
Nitro → 200 + Product[]
```

---

## GET `/api/products/:slug` → `[slug].get.ts`

```text
ALGORITMO OBTENER_PRODUCTO

    slug ← OBTENER parámetro "slug" de la URL

    SI slug NO EXISTE ENTONCES
        ERROR 400
        "El parámetro slug es requerido."
    FIN SI

    producto ← BUSCAR en products
                DONDE producto.slug = slug

    SI producto NO EXISTE ENTONCES
        ERROR 404
        "El producto no existe."
    FIN SI

    RETORNAR producto

FIN
```

**Flujo:**

```text
OBTENER slug
    ↓
¿Existe slug?
 ├── NO → 400
 └── SÍ
       ↓
BUSCAR producto
       ↓
¿Existe?
 ├── NO → 404
 └── SÍ
       ↓
RETORNAR producto → 200
```

---

## POST `/api/products` → `index.post.ts`

```text
ALGORITMO CREAR_PRODUCTO

    body ← LEER body de la petición

    SI body NO EXISTE ENTONCES
        ERROR 400
        "El body es requerido."
    FIN SI


    // Validar name

    SI name NO EXISTE
       O name NO ES TEXTO
       O name ESTÁ VACÍO ENTONCES

        ERROR 400
        "El campo name es requerido y debe ser un texto válido."

    FIN SI


    // Validar price

    SI price NO EXISTE
       O price NO ES NÚMERO
       O price < 0 ENTONCES

        ERROR 400
        "El campo price debe ser un número mayor o igual a cero."

    FIN SI


    // Validar quantity

    SI quantity NO EXISTE
       O quantity NO ES NÚMERO
       O quantity < 0 ENTONCES

        ERROR 400
        "El campo quantity debe ser un número mayor o igual a cero."

    FIN SI


    // Validar slug

    SI slug NO EXISTE
       O slug NO ES TEXTO
       O slug ESTÁ VACÍO ENTONCES

        ERROR 400
        "El campo slug es requerido y debe ser un texto válido."

    FIN SI


    // Validar slug duplicado

    productoExistente ← BUSCAR en products
                         DONDE producto.slug = slug

    SI productoExistente EXISTE ENTONCES
        ERROR 409
        "El slug ya está siendo utilizado."
    FIN SI


    // Crear producto

    nuevoProducto ← {
        id: LONGITUD(products) + 1,
        name: name,
        price: price,
        quantity: quantity,
        slug: slug
    }


    // Guardar

    AGREGAR nuevoProducto A products


    // Responder

    RETORNAR nuevoProducto
    STATUS 201

FIN
```

**Punto importante:**

```text
price = 0       → VÁLIDO
quantity = 0    → VÁLIDO
```

Por eso **no** usamos:

```text
SI !price
SI !quantity
```

La condición correcta conceptualmente es:

```text
SI el valor está ausente
   O no es número
   O es menor que 0
```

---

## PATCH `/api/products/:slug` → `[slug].patch.ts`

```text
ALGORITMO ACTUALIZAR_PRODUCTO_PARCIALMENTE

    slug ← OBTENER parámetro "slug" de la URL


    // Buscar producto existente

    producto ← BUSCAR en products
                DONDE producto.slug = slug

    SI producto NO EXISTE ENTONCES
        ERROR 404
        "El producto no existe."
    FIN SI


    // Leer cambios

    body ← LEER body de la petición

    SI body NO EXISTE
       O body ESTÁ VACÍO ENTONCES

        ERROR 400
        "El body no puede estar vacío."

    FIN SI


    // Validar únicamente los campos enviados

    SI name !== undefined ENTONCES

        SI name NO ES TEXTO
           O name ESTÁ VACÍO ENTONCES

            ERROR 400
            "El campo name no es válido."

        FIN SI

    FIN SI


    SI price !== undefined ENTONCES

        SI price NO ES NÚMERO
           O price < 0 ENTONCES

            ERROR 400
            "El campo price no es válido."

        FIN SI

    FIN SI


    SI quantity !== undefined ENTONCES

        SI quantity NO ES NÚMERO
           O quantity < 0 ENTONCES

            ERROR 400
            "El campo quantity no es válido."

        FIN SI

    FIN SI


    SI newSlug !== undefined ENTONCES

        SI newSlug NO ES TEXTO
           O newSlug ESTÁ VACÍO ENTONCES

            ERROR 400
            "El campo slug no es válido."

        FIN SI


        otroProducto ← BUSCAR en products
                        DONDE producto.slug = newSlug
                        Y producto NO ES productoActual

        SI otroProducto EXISTE ENTONCES
            ERROR 409
            "El slug ya está siendo utilizado."
        FIN SI

    FIN SI


    // Aplicar únicamente los cambios recibidos

    SI name !== undefined ENTONCES
        producto.name ← name
    FIN SI

    SI price !== undefined ENTONCES
        producto.price ← price
    FIN SI

    SI quantity !== undefined ENTONCES
        producto.quantity ← quantity
    FIN SI

    SI newSlug !== undefined ENTONCES
        producto.slug ← newSlug
    FIN SI


    RETORNAR producto
    STATUS 200

FIN
```

### Concepto fundamental de PATCH

```text
PATCH = modificar parcialmente

Si viene name:
    actualizar name

Si viene price:
    actualizar price

Si NO viene quantity:
    conservar quantity

Si NO viene slug:
    conservar slug
```

Por ejemplo:

```text
PATCH /products/keyboard

{
    quantity: 0
}
```

Resultado conceptual:

```text
ANTES
{
    name: "Keyboard",
    price: 100,
    quantity: 10,
    slug: "keyboard"
}

        ↓ PATCH quantity = 0

DESPUÉS
{
    name: "Keyboard",
    price: 100,
    quantity: 0,
    slug: "keyboard"
}
```

---

## DELETE `/api/products/:slug` → `[slug].delete.ts`

```text
ALGORITMO ELIMINAR_PRODUCTO

    slug ← OBTENER parámetro "slug" de la URL

    SI slug NO EXISTE ENTONCES
        ERROR 400
        "El parámetro slug es requerido."
    FIN SI


    // Buscar posición

    indice ← BUSCAR ÍNDICE en products
              DONDE producto.slug = slug


    SI indice NO EXISTE ENTONCES
        ERROR 404
        "El producto no existe."
    FIN SI


    // Eliminar

    ELIMINAR 1 elemento de products
    DESDE indice


    // No devolver contenido

    STATUS 204

FIN
```

**Flujo:**

```text
OBTENER slug
    ↓
¿Existe slug?
 ├── NO → 400
 └── SÍ
       ↓
BUSCAR índice
       ↓
¿Existe producto?
 ├── NO → 404
 └── SÍ
       ↓
SPLICE / ELIMINAR
       ↓
204 No Content
```

Un segundo:

```text
DELETE /products/keyboard
```

después de haberlo eliminado produce:

```text
BUSCAR "keyboard"
       ↓
NO EXISTE
       ↓
404
```

---

# Resumen de los algoritmos

| Método         | Acción                 | Si no existe | Éxito |
| -------------- | ---------------------- | ------------ | ----- |
| `GET`          | Obtener todos          | —            | `200` |
| `GET :slug`    | Obtener uno            | `404`        | `200` |
| `POST`         | Crear                  | —            | `201` |
| `PATCH :slug`  | Modificar parcialmente | `404`        | `200` |
| `DELETE :slug` | Eliminar               | `404`        | `204` |

### Regla mental

```text
GET
    BUSCAR → DEVOLVER

POST
    VALIDAR → CREAR → PUSH → DEVOLVER

PATCH
    BUSCAR → VALIDAR CAMBIOS → MODIFICAR → DEVOLVER

DELETE
    BUSCAR → SPLICE → NO DEVOLVER CONTENIDO
```

### Diferencia POST / PATCH / PUT

```text
POST
    "Quiero CREAR un producto nuevo."
    → push()

PATCH
    "Quiero CAMBIAR algunas propiedades."
    → modificar solo lo recibido

PUT
    "Quiero REEMPLAZAR/actualizar el recurso completo."
    → exigir todos los campos
```
