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

## Bitácora de Errores Reales
Sin errores del alumno en esta sesión. Hipótesis inicial ("¿lo armo como JSON?") corregida por razonamiento a "doble JSON" antes de implementar.
