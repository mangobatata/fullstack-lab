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
