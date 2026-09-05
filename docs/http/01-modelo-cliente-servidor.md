# 01 — Modelo Cliente-Servidor y Ciclo Request/Response

## Objetivo

Comprender qué ocurre a bajo nivel cuando un usuario interactúa con la web antes de tocar cualquier framework o abstracción.

---

## Escenario Analizado

Un usuario abre el navegador y escribe:
```text
https://ejemplo.com/productos
```
y presiona **Enter**.

---

## Razonamiento Paso a Paso

### 1. ¿Quién inicia la comunicación?
El **navegador (cliente)**. 
En el modelo web tradicional, el servidor no envía información por iniciativa propia sin que un cliente la solicite. El servidor escucha pasivamente en un puerto hasta recibir una petición.

### 2. ¿Qué información viaja en la petición (Request)?
El navegador no inventa datos de productos porque aún no los conoce. Lo que envía es una intención estructurada:
- **Método HTTP:** `GET` (indica que queremos consultar/obtener datos).
- **Ruta / Recurso (Path):** `/productos` (identifica qué recurso del servidor estamos pidiendo).
- **Destino (Host):** `ejemplo.com`.

```http
GET /productos HTTP/1.1
Host: ejemplo.com
```

### 3. ¿Quién procesa y responde?
El **servidor** remoto recibe la petición, localiza la información solicitada y emite una **respuesta (Response)**.

### 4. ¿Qué información regresa en la respuesta?
La respuesta contiene dos partes esenciales:
- **Código de Estado (Status Code):** Informa el resultado de la operación (ej. `200 OK`, `404 Not Found`, `500 Internal Server Error`).
- **Cuerpo (Body):** Los datos solicitados si la operación fue exitosa (ej. lista de productos en formato JSON / HTML), o los detalles del error si falló.

```http
HTTP/1.1 200 OK
Content-Type: application/json

[
  { "id": 1, "nombre": "Teclado Mecánico", "precio": 75.00 }
]
```

---

## Diagrama del Ciclo

```text
┌──────────────┐                                       ┌──────────────┐
│   Browser    │  Petición: GET /productos             │   Servidor   │
│  (Cliente)   │ ────────────────────────────────────> │  (Proceso)   │
│              │                                       │              │
│              │  Respuesta: 200 OK + [lista_productos]│              │
│  Renderiza UI│ <──────────────────────────────────── │  Busca datos │
└──────────────┘                                       └──────────────┘
```

---

## Bitácora de Aprendizaje y Errores Reales

### Error inicial
Al preguntar qué información viaja en la petición al entrar a `https://ejemplo.com/productos`, la primera hipótesis fue:
> *"Nombre del producto"*

### Razonamiento y corrección
Al analizar el contexto del cliente en ese momento:
1. El usuario recién está ingresando a la URL general.
2. El navegador **no conoce** los productos que existen en la base de datos del servidor.
3. Por ende, no puede filtrar ni enviar un nombre específico.
4. La intención real es solicitar el recurso general (el catálogo completo) mediante `GET /productos`.

---

## Conceptos Clave Fijados

- **Cliente / Servidor:** Modelo asimétrico donde el cliente solicita y el servidor responde.
- **Request (Petición):** Acción (`GET`) + Recurso (`/productos`).
- **Response (Respuesta):** Estado (`Status Code`) + Contenido (`Body`).

## Primer endpoint del catálogo

Para obtener la colección completa, el contrato inicial será:

```http
GET /products
```

El servidor buscará los productos en memoria y responderá con `200 OK` y un body JSON.

Para enrutar una request, se revisan el método y el `pathname` de su URL:

```ts
const url = new URL(request.url);

url.pathname; // "/products"
request.method; // "GET"
```

Se compara el `pathname`, no la URL completa, porque esta también contiene protocolo, dominio, puerto y posibles query parameters.

En el ejercicio práctico, Bun ejecutará el archivo TypeScript y `node:http` proporcionará la API para crear el servidor HTTP.

### Elección de runtime

Node.js continúa siendo la referencia de compatibilidad y soporte a largo plazo del ecosistema JavaScript. Bun aporta ejecución directa de TypeScript y compatibilidad con muchas APIs de Node, pero su compatibilidad sigue siendo un trabajo en progreso. Para este laboratorio usaremos Bun para ejecutar y `node:http` para practicar una API estándar de Node; más adelante podremos ejecutar el mismo servidor directamente con Node.

`createServer` recibe un callback que se ejecuta para cada petición entrante:

```text
createServer(callback)
        │
        └── callback(request, response)
```

`request` contiene la información enviada por el cliente, como `method` y `url`. `response` es el objeto que el servidor utiliza para definir status, headers y body.

Configurar un status con `res.writeHead(404)` no finaliza la respuesta. El servidor debe llamar después a `res.end(...)`; de lo contrario, el cliente puede quedarse esperando el cierre del response.

Cuando el body contiene JSON, la respuesta debe declarar el formato mediante el header `Content-Type: application/json`, tanto para respuestas exitosas como para errores JSON.

Una respuesta JSON mínima con `node:http` combina status, headers y body:

```ts
res.writeHead(200, { "Content-Type": "application/json" });
res.end(JSON.stringify(products));
```

### Error 12: Confundir status HTTP con body y pasar un objeto a `res.end`

El status se configura con `res.writeHead(...)`; no es necesario repetirlo dentro del JSON. Además, `res.end` debe recibir una cadena o un buffer, por lo que un objeto debe serializarse con `JSON.stringify`. Para el endpoint de un producto, el body exitoso es directamente el producto encontrado.

Al enrutar `/products/:slug` con `split`, no basta con comprobar que exista `slug`: también conviene validar que la cantidad de segmentos corresponda exactamente a la ruta esperada. Así `/products/mouse/reviews` no se interpreta accidentalmente como una búsqueda de producto.

El handler HTTP debe reutilizar `findProductBySlug` para resolver el producto. De este modo, la búsqueda permanece en una función de datos y el handler se concentra en traducir su resultado a una respuesta HTTP.

`201 Created` corresponde a un `POST` que creó un recurso. Si una ruta existe pero el método solicitado todavía no está implementado, `405 Method Not Allowed` describe mejor la situación que `200`.

Para evitar repetir la configuración de respuestas JSON, conviene centralizarla en un helper que reciba `response`, status y datos. El handler queda dedicado al enrutamiento y a la decisión del resultado.

### Error 13: No detener el handler después de responder

Después de enviar una respuesta con `sendJSON`, el callback debe ejecutar `return`. Si continúa, puede alcanzar otra rama y tratar de enviar una segunda respuesta para la misma request, provocando un error de headers ya enviados.

En `node:http`, `createServer` entrega esos objetos al callback. Solo se importa `createServer`; el objeto de request ya llega como parámetro (`req`) y no debe importarse como una función aparte.

### Error 11: Retornar datos no envía una respuesta HTTP

Dentro del callback de `createServer`, `return products` solo retorna desde esa función de JavaScript; Node no lo convierte automáticamente en un body HTTP. Para responder hay que usar `res`, definir el estado y headers necesarios, y finalizar la respuesta con `res.end(...)`.
