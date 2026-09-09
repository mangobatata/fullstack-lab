# Ruta de Productos Fullstack

## Objetivo

Avanzar desde fundamentos técnicos hasta productos SaaS desplegados y preparados para usuarios reales.

Cada proyecto reutiliza lo anterior e introduce pocas dificultades nuevas. No se cambia de stack sin una razón pedagógica concreta.

## Fundamentos completados

### 01–04 — TypeScript, HTTP y Nitro

* TypeScript estricto.
* Servidor con `node:http`.
* Semántica HTTP.
* Validación.
* CRUD en memoria.
* Introducción a Nitro.

### 05 — PostgreSQL y SQL

* PostgreSQL con Docker.
* Tablas y restricciones.
* Consultas SQL.
* Cliente `pg`.
* Consultas parametrizadas.
* Prevención de inyección SQL.

### 06 — API persistente

* CRUD Nitro con PostgreSQL.
* Slugs.
* Manejo de errores HTTP.
* Pruebas de extremo a extremo mediante Bash.

## Etapa I — Productos pequeños

Estas aplicaciones deben poder completarse rápidamente. Cada una enseña una capacidad específica.

### 07 — Task Manager colaborativo

Primer producto fullstack completo.

Capacidades:

* Drizzle ORM;
* esquema y migraciones;
* usuarios, proyectos y tareas;
* relaciones;
* registro y login;
* hash de contraseñas;
* sesiones mediante cookies;
* autorización por propietario;
* roles básicos;
* verificación de email;
* recuperación de contraseña;
* filtros y paginación;
* Nuxt;
* pruebas de API y frontend;
* primer despliegue completo.

El objetivo no es competir con Trello. Es dominar la estructura central de una aplicación SaaS.

### 08 — Plataforma de enlaces y páginas públicas

Un producto similar conceptualmente a una combinación pequeña de Bitly, Linktree y analítica.

Capacidades:

* enlaces públicos y privados;
* redirecciones;
* identificadores únicos;
* códigos QR;
* dominios o slugs personalizados;
* eventos de visitas;
* agregación de estadísticas;
* dashboards;
* trabajos en segundo plano;
* límites por plan;
* caché;
* exportación de datos.

Este producto introduce eventos y analítica sin la complejidad de pagos y órdenes.

### 09 — Formularios como servicio

Producto para crear formularios, publicarlos y recibir respuestas.

Capacidades:

* constructor dinámico;
* diferentes tipos de campos;
* esquemas configurables;
* validación generada;
* formularios públicos;
* respuestas y archivos;
* notificaciones;
* webhooks salientes;
* protección contra abuso;
* colaboración;
* integración embebible.

Este producto enseña configuración dinámica y software extensible.

## Etapa II — Productos comerciales

### 10 — E-commerce completo

No será solamente un catálogo.

Capacidades:

* productos y variantes;
* categorías;
* imágenes;
* precios;
* carrito;
* descuentos;
* inventario;
* reserva de stock;
* checkout;
* órdenes;
* pagos;
* webhooks;
* idempotencia;
* reembolsos;
* historial de estados;
* panel administrativo;
* búsqueda;
* emails transaccionales.

El objetivo es aprender operaciones transaccionales e integraciones externas.

### 11 — Marketplace de dos lados

La temática concreta se elegirá según un problema interesante para el alumno.

Capacidades:

* dos tipos principales de usuarios;
* perfiles;
* publicaciones;
* búsqueda y filtros;
* solicitudes o contrataciones;
* mensajería;
* reputación;
* moderación;
* comisiones;
* pagos divididos cuando corresponda;
* disputas;
* auditoría;
* notificaciones en tiempo real.

El objetivo es aprender reglas de negocio que involucran varios actores.

### 12 — Plataforma de automatizaciones

Producto inspirado conceptualmente en herramientas como Zapier, n8n o productos de automatización modernos, con alcance controlado.

Capacidades:

* conexiones;
* triggers;
* acciones;
* workflows;
* ejecución asíncrona;
* colas;
* reintentos;
* backoff;
* idempotencia;
* historial de ejecuciones;
* secretos cifrados;
* rate limits;
* webhooks entrantes y salientes;
* observabilidad.

El objetivo es aprender sistemas orientados a eventos y procesos en segundo plano.

## Etapa III — Productos avanzados

### 13 — SaaS colaborativo con IA

La IA debe resolver un problema concreto, no agregarse como decoración.

Posibles direcciones:

* espacio de conocimiento que responde usando documentos;
* asistente para clasificar y resolver solicitudes;
* análisis de conversaciones y extracción de acciones;
* investigación asistida con fuentes;
* automatización de tareas administrativas.

Capacidades:

* integración con modelos;
* respuestas estructuradas;
* streaming;
* archivos;
* búsqueda semántica;
* recuperación de contexto;
* trabajos largos;
* control de costos;
* evaluaciones;
* trazabilidad;
* intervención humana;
* aislamiento de datos;
* resistencia a instrucciones maliciosas.

### 14 — Producto SaaS para usuarios reales

Este será el proyecto final de TypeScript.

No debe seleccionarse solamente por su dificultad técnica. Debe partir de un problema concreto que pueda validarse con posibles usuarios.

Debe incluir:

* landing page;
* onboarding;
* organizaciones o espacios de trabajo;
* roles y permisos;
* autenticación completa;
* suscripciones;
* límites por plan;
* emails;
* archivos;
* auditoría;
* administración;
* soporte;
* política de privacidad;
* términos básicos;
* copias de seguridad;
* CI/CD;
* ambientes separados;
* migraciones seguras;
* logs estructurados;
* métricas;
* trazas;
* alertas;
* pruebas;
* estrategia de rollback;
* documentación operativa.

El cierre requiere desplegarlo, conseguir retroalimentación y mejorar al menos un flujo basándose en uso real.

## Etapa IV — Go

Go comienza después de que el alumno pueda construir y desplegar el producto fullstack con TypeScript.

### Fase inicial

Crear servicios pequeños para aprender:

* sintaxis;
* tipos;
* structs;
* interfaces;
* errores;
* módulos;
* testing;
* HTTP;
* contexto;
* concurrencia;
* PostgreSQL.

### Aplicaciones en Go

1. Reimplementar una API pequeña ya comprendida.
2. Crear un procesador de webhooks idempotente.
3. Crear un worker de emails o notificaciones.
4. Crear un servicio de procesamiento concurrente.
5. Construir una API completa en Go.
6. Integrar un servicio Go en un producto existente solo cuando exista una razón real.

No dividir una aplicación en microservicios únicamente para practicar. Introducir servicios separados cuando haya necesidades claras de concurrencia, aislamiento, rendimiento o despliegue independiente.

## Puertas de avance

Un producto no está terminado solamente porque su camino feliz funciona.

Antes de avanzar, el alumno debe poder:

* explicar su arquitectura;
* describir el modelo de datos;
* justificar decisiones importantes;
* ejecutar typecheck y pruebas;
* depurar un fallo;
* explicar su seguridad;
* desplegarlo;
* identificar limitaciones;
* aplicar el concepto principal en otro contexto.

## Adaptación

Los nombres o dominios de los productos pueden cambiar si surge una idea mejor. Las capacidades pedagógicas y el aumento gradual de dificultad deben mantenerse.

## Proyecto especializado — API de producción con JWT Bearer

Construir un producto **API-first** preparado para producción. La API debe poder ser consumida por una aplicación Nuxt, clientes externos e integraciones, sin depender de las sesiones del Task Manager.

Una posible temática es una plataforma headless de comercio, contenido o automatización. La temática puede cambiar, pero los objetivos técnicos de autenticación y seguridad deben mantenerse.

### Objetivo pedagógico

Aprender a diseñar, implementar, proteger, documentar, probar y desplegar una API profesional basada en access tokens JWT enviados mediante el esquema Bearer.

No presentar JWT como "una sesión más moderna". Compararlo con las sesiones opacas aprendidas anteriormente y justificar sus ventajas, costes y riesgos.

### Flujo principal

```text
Registro
→ verificación de email
→ login
→ access token JWT de corta duración
→ Authorization: Bearer <token>
→ acceso a recursos protegidos
→ expiración del access token
→ refresh token
→ rotación
→ nuevo access token
→ logout o revocación
```

### Registro y credenciales

Implementar y enseñar:

* registro;
* normalización y unicidad del email;
* hash seguro de contraseñas;
* verificación de email mediante token de un solo uso;
* expiración e invalidación del token;
* reenvío controlado del email;
* protección contra enumeración de cuentas;
* login;
* rate limiting;
* registro seguro de intentos;
* recuperación de contraseña;
* invalidación de sesiones y refresh tokens después de restablecerla.

La base de datos nunca debe guardar contraseñas originales ni tokens de recuperación en texto plano.

### Access token JWT

El access token debe:

* enviarse mediante `Authorization: Bearer <token>`;
* tener una vida corta;
* contener la información mínima necesaria;
* estar firmado;
* no contener contraseñas, secretos ni información privada innecesaria;
* validarse completamente en cada petición protegida.

Enseñar y validar claims como:

* `sub`: identificador del usuario;
* `iss`: emisor;
* `aud`: audiencia;
* `iat`: fecha de emisión;
* `exp`: expiración;
* `nbf`, cuando corresponda;
* `jti`, cuando se necesite identificar el token;
* scopes o permisos limitados.

El alumno debe comprender que un JWT firmado no está cifrado y que su payload puede leerse.

### Firma y claves

Enseñar progresivamente:

1. firma simétrica y su modelo de confianza;
2. firma asimétrica;
3. clave privada para firmar;
4. clave pública para verificar;
5. identificación de claves mediante `kid`;
6. rotación de claves;
7. publicación de claves mediante JWKS cuando sea útil.

La implementación debe permitir explícitamente solo los algoritmos esperados. Nunca debe confiar ciegamente en el algoritmo indicado por el token.

### Refresh tokens

Implementar refresh tokens separados de los access tokens.

Los refresh tokens deben:

* tener mayor duración que el access token;
* permanecer confidenciales;
* almacenarse de forma segura;
* guardarse hasheados en la base de datos cuando el servidor necesite verificarlos;
* asociarse con usuario, sesión o familia de tokens;
* tener fecha de creación, expiración y revocación;
* rotarse después de cada uso;
* invalidar el token anterior;
* detectar intentos de reutilización;
* permitir cerrar una sesión concreta o todas las sesiones.

Explicar por qué un refresh token robado es una credencial sensible y por qué la rotación requiere estado persistente.

### Cliente web Nuxt

Construir un cliente Nuxt para consumir la API.

No guardar credenciales duraderas en `localStorage`.

Explorar y comparar dos arquitecturas:

#### Access token en memoria

* access token mantenido temporalmente en memoria;
* refresh token protegido mediante cookie `HttpOnly`, `Secure` y configuración apropiada de `SameSite`;
* renovación controlada;
* protección CSRF cuando la cookie participa en autenticación;
* manejo de pestañas, recargas y expiración.

#### Backend for Frontend

* el navegador utiliza una cookie segura;
* Nuxt actúa como Backend for Frontend;
* el servidor Nuxt administra los tokens frente a la API;
* los JWT no quedan expuestos al JavaScript del navegador.

El tutor debe enseñar las dos opciones y hacer que el alumno justifique la elegida.

### Autorización

Después de autenticar al usuario, implementar:

* propiedad de recursos;
* roles;
* permisos;
* scopes;
* separación entre autenticación y autorización;
* respuestas `401` y `403` correctas;
* protección de cada operación, no solamente de las rutas visibles;
* prevención de acceso a objetos pertenecientes a otros usuarios.

Nunca asumir que un JWT válido concede acceso automático a cualquier recurso.

### Capacidades de una API profesional

El proyecto debe cubrir progresivamente:

* diseño consistente de endpoints;
* versionado;
* validación de entradas;
* serialización segura de respuestas;
* paginación;
* filtros y ordenamiento;
* búsqueda;
* manejo uniforme de errores;
* identificadores no predecibles cuando corresponda;
* CORS;
* rate limiting;
* claves de idempotencia;
* webhooks firmados;
* reintentos;
* transacciones;
* concurrencia;
* auditoría;
* OpenAPI;
* documentación para consumidores;
* SDK pequeño en TypeScript;
* health checks;
* readiness checks.

### Seguridad operativa

Incluir:

* secretos mediante variables de entorno;
* claves fuera del repositorio;
* rotación de secretos;
* HTTPS en producción;
* logs sin contraseñas ni tokens completos;
* protección contra fuerza bruta;
* límites de tamaño;
* dependencias auditadas;
* encabezados de seguridad;
* política de expiración;
* revocación por incidentes;
* separación entre ambientes;
* migraciones seguras.

### Pruebas obligatorias

Probar como mínimo:

* login válido;
* contraseña incorrecta;
* usuario no verificado;
* JWT ausente;
* JWT malformado;
* firma inválida;
* algoritmo inesperado;
* token expirado;
* emisor incorrecto;
* audiencia incorrecta;
* scope insuficiente;
* acceso a un recurso ajeno;
* refresh válido;
* refresh expirado;
* rotación correcta;
* reutilización de un refresh token anterior;
* logout de una sesión;
* logout de todas las sesiones;
* cambio de contraseña;
* rate limiting;
* idempotencia;
* webhooks con firma válida e inválida.

### Observabilidad y producción

Antes del cierre:

* crear logs estructurados;
* correlacionar peticiones mediante request ID;
* registrar métricas de autenticación sin exponer credenciales;
* medir latencia y errores;
* configurar alertas básicas;
* construir imagen Docker;
* ejecutar CI;
* desplegar API y cliente;
* ejecutar migraciones;
* probar el ambiente desplegado;
* documentar rollback y recuperación.

### Criterios de aprendizaje

El proyecto solamente se considera terminado cuando el alumno puede explicar:

* qué partes componen un JWT;
* por qué firma no significa cifrado;
* por qué el access token expira;
* por qué existe el refresh token;
* cómo funciona la rotación;
* qué ocurre al reutilizar un refresh token;
* cómo se revocan credenciales;
* dónde almacena cada token el cliente web;
* diferencia entre `401` y `403`;
* diferencia entre roles y scopes;
* diferencia entre JWT y sesión opaca;
* cuándo JWT aporta valor y cuándo añade complejidad innecesaria.

### Posición en el currículo

Realizar este proyecto después de haber completado:

1. autenticación con sesiones opacas;
2. cookies seguras;
3. autorización por propietario;
4. verificación de email correo;
5. recuperación de contraseña;
6. pruebas de autenticación.

No mezclar ambos mecanismos durante su primera implementación. El Task Manager enseña sesiones; esta API enseña JWT Bearer y autenticación basada en tokens.
