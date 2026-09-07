# Pseudocódigo — API de productos (Nitro)

Contrato común: éxito devuelve el **recurso directo** (array u objeto).
Los errores viajan por **status HTTP + mensaje** (`400`, `404`, `409`).
La colección en memoria solo informa; el **handler decide** el status.

---

## `GET /api/products` → `index.get.ts`

```text
ENTRA:  nada (sin params, sin body)
SALE:   200 + Product[]

1. retornar products
```

---

## `GET /api/products/:slug` → `[slug].get.ts`

```text
ENTRA:  slug en la URL
SALE:   200 + Product | 400 | 404

1. slug = getRouterParam(event, "slug")
2. SI no hay slug → 400 "slug requerido"
3. product = products.find(p.slug == slug)
4. SI no existe → 404 "no existe"
5. retornar product
```

---

## `POST /api/products` → `index.post.ts`

```text
ENTRA:  body { name, price, quantity, slug } (todo obligatorio)
SALE:   201 + Product creado | 400 | 409

1. body = await readBody<CreateProductInput>(event)
2. SI no hay body → 400
3. validar name: string no vacío → si falla, 400
4. validar price: number >= 0 (acepta 0) → si falla, 400
5. validar quantity: number >= 0 (acepta 0) → si falla, 400
6. validar slug: string no vacío → si falla, 400
7. SI algún slug existente == slug → 409 "ya en uso"
8. nuevo = { id: products.length + 1, name, price, quantity, slug }
9. products.push(nuevo)
10. status = 201
11. retornar nuevo
```

---

## `PATCH /api/products/:slug` → `[slug].patch.ts`

```text
ENTRA:  slug en la URL + body parcial (solo lo que cambia)
SALE:   200 + Product actualizado | 400 | 404 | 409

1. slug = getRouterParam(event, "slug")
2. SI no hay slug → 400
3. product = products.find(p.slug == slug)
4. SI no existe → 404
5. patch = await readBody<Partial<CreateProductInput>>(event)
6. SI body vacío o sin claves → 400
7. PARA CADA campo presente (!== undefined): validar su regla
   - newSlug: string no vacío + no usado por OTRO producto → si usado, 409
   - name: string no vacío
   - price: number >= 0
   - quantity: number >= 0
8. aplicar solo los campos que vinieron
9. retornar product
```

Diferencia clave con PUT: PATCH valida **solo lo que vino**;
PUT exigiría el recurso completo.

---

## `DELETE /api/products/:slug` → `[slug].delete.ts`

```text
ENTRA:  slug en la URL
SALE:   204 (vacío) | 400 | 404

1. slug = getRouterParam(event, "slug")
2. SI no hay slug → 400
3. i = products.findIndex(p.slug == slug)
4. SI i == -1 → 404 "no existe, nada que borrar"
5. products.splice(i, 1)
6. status = 204, retornar vacío
```

Un segundo DELETE al mismo slug → `404`.
El front ya sabe qué borró: no se devuelve body.
