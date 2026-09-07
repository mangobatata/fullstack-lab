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

## Bitácora de Errores Reales

Sin errores del alumno en esta sesión. Hipótesis inicial ("¿lo armo como JSON?") corregida por razonamiento a "doble JSON" antes de implementar.
