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
