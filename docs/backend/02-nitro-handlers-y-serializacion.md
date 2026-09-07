# 02 — Handlers Nitro y Serialización Automática

## Objetivo

Entender que un handler Nitro retorna valores JS y Nitro los convierte en respuesta HTTP.

## Razonamiento

```text
handler retorna Product[] (memoria del servidor)
        │
        ▼
Nitro serializa → JSON + content-type + status 200
        │
        ▼
navegador recibe Response HTTP
```

En `node:http` se hacía a mano:

```text
writeHead(200, { content-type }) + JSON.stringify + end
```

En Nitro (`exercises/04-nitro-api/server/api/products/index.get.ts`):

```ts
export default defineHandler(() => {
  return products;
});
```

No se retorna `Response` ni se llama `JSON.stringify`. Hacerlo duplicaría la serialización: el cliente recibiría un string JSON dentro de otro JSON en lugar de un array.

## Separación: dato vs. decisión HTTP (2026-09-07)

```text
colección.exists(slug) → Product | undefined
        │
        ▼
handler decide → 200 + producto | 404 + error JSON
```

El alumno formuló correctamente: ante slug inexistente corresponde `404 Not Found`; el body de error lo define el contrato con el cliente; la colección solo informa existencia, el handler decide el status.

## Implementación `[slug].get.ts` (2026-09-07)

```text
getRouterParam(event, "slug") → find por slug → 200 + producto | 400 sin slug | 404 no existe
```

Prueba real: `GET /api/products/wireless-mouse` → `200` + producto; `GET /api/products/no-existe` → `404` + mensaje. `tsc --noEmit` sin errores.

## Contrato: recurso directo, sin envoltorio (2026-09-07)

Se descartó `{ ok, data }`: `ok` duplicaba al status HTTP y `{ data }` no aporta seguridad (convención, no defensa). Contrato final: `GET /api/products` → array; `GET /api/products/:slug` → objeto; errores vía status + mensaje. Verificado: `200` + producto pelado, `404` ante slug inexistente.

## POST con validación (2026-09-07)

```text
readBody<CreateProductInput> → 400 sin body/campos → 409 slug duplicado → push + 201 + producto
```

Aprendizajes: `Partial`/DTO para input no confiable; `!quantity` rechazaba el `0` válido (corregido a `=== undefined`); `id: length + 1`; `201` para creación; contrato recurso-directo también en POST. Verificado: `201` + producto, `409` duplicado, `201` con `quantity: 0`.

## PATCH parcial (2026-09-07)

```text
:slug → 404 si no existe → readBody<Partial<Create>> → 400 body vacío → validar solo lo que vino (!== undefined) → 409 slug de otro → 200 + producto
```

Lección: PATCH valida condicionalmente (PUT exigiría todo). Verificado: parcial `200`, `404`, `409`, `tsc` limpio, recurso directo.

## Seguridad: `stack` en dev vs. producción (2026-09-07)

En `nitro dev` el `404` incluía `stack` con rutas internas (`/home/.../node_modules/...`). El alumno detectó el riesgo: expone dónde vive el proyecto. Verificado con `nitro build` + producción: el body queda solo en `{ error, status, message }`, sin `stack`. Regla: log detallado en el servidor, mensaje mínimo al cliente.
## Bitácora de Errores Reales
Sin errores del alumno en esta sesión. Hipótesis inicial ("¿lo armo como JSON?") corregida por razonamiento a "doble JSON" antes de implementar.
