# Algoritmos — API de productos (Nitro)

Regla común: la colección informa, el handler decide el status.
Éxito = recurso directo. Error = status + mensaje.

---

## `GET /api/products` → `index.get.ts`

```text
// 1. Retornar la colección completa
//         ↓
// 2. Nitro serializa → 200 + Product[]
```

---

## `GET /api/products/:slug` → `[slug].get.ts`

```text
// 1. Obtener slug de URL
//         ↓
// 2. ¿No viene el slug?
//    → 400
//         ↓
// 3. Buscar producto por slug
//         ↓
// 4. ¿No existe?
//    → 404
//         ↓
// 5. Devolver producto → 200
```

---

## `POST /api/products` → `index.post.ts`

```text
// 1. Leer body
//         ↓
// 2. ¿No hay body?
//    → 400
//         ↓
// 3. Validar name (texto no vacío)
//    ¿Falla?
//    → 400
//         ↓
// 4. Validar price (number >= 0, acepta 0)
//    ¿Falla?
//    → 400
//         ↓
// 5. Validar quantity (number >= 0, acepta 0)
//    ¿Falla?
//    → 400
//         ↓
// 6. Validar slug (texto no vacío)
//    ¿Falla?
//    → 400
//         ↓
// 7. ¿Slug ya usado por otro producto?
//    → 409
//         ↓
// 8. Crear producto con id = length + 1
//         ↓
// 9. Guardar en el array (push)
//         ↓
// 10. Devolver creado → 201
```

---

## `PATCH /api/products/:slug` → `[slug].patch.ts`

```text
// 1. Obtener slug de URL
//         ↓
// 2. Buscar producto
//         ↓
// 3. ¿No existe?
//    → 404
//         ↓
// 4. Leer body (parcial: solo lo que cambia)
//         ↓
// 5. ¿Body vacío?
//    → 400
//         ↓
// 6. Validar solo los campos que vinieron (!== undefined)
//         ↓
// 7. Si cambia el slug:
//    comprobar que el nuevo slug no esté usado por OTRO producto
//    ¿Está usado?
//    → 409
//         ↓
// 8. Actualizar el producto existente (solo lo que vino)
//         ↓
// 9. Devolver producto actualizado → 200
```

PATCH valida solo lo que vino; PUT exigiría el recurso completo.

---

## `DELETE /api/products/:slug` → `[slug].delete.ts`

```text
// 1. Obtener slug de URL
//         ↓
// 2. ¿No viene el slug?
//    → 400
//         ↓
// 3. Buscar índice del producto
//         ↓
// 4. ¿No existe?
//    → 404
//         ↓
// 5. Remover de la memoria (splice)
//         ↓
// 6. Nada más que decir → 204 (vacío)
```

Un segundo DELETE al mismo slug → 404.
