# Fullstack Lab

Laboratorio de aprendizaje práctico de Ingeniería de Software y Desarrollo Fullstack.

Este repositorio documenta el razonamiento, experimentos, código, errores y evolución técnica desde fundamentos básicos hasta sistemas web en producción.

---

## Filosofía de Trabajo

1. **Razonar antes de codificar:** Comprender qué entra, qué sale, quién inicia y qué puede fallar antes de escribir una sola línea.
2. **Fundamento antes que framework:** Entender el protocolo HTTP, procesos del SO y bases de datos antes de usar abstracciones de alto nivel.
3. **Aprender de los errores:** Cada error real de concepto se documenta junto a su corrección y aprendizaje.
4. **Construcción incremental:** De programas mínimos a sistemas con persistencia, autenticación y despliegue.

---

## Hoja de Ruta (Roadmap)

```text
[ En curso ] Nivel 1 — Fundamentos (TypeScript, Modelo Cliente/Servidor, HTTP básico)
[          ] Nivel 2 — Cliente + Servidor (Formularios, APIs REST en memoria, JSON)
[          ] Nivel 3 — Persistencia de Datos (PostgreSQL, SQL relacional puro, migraciones)
[          ] Nivel 4 — Aplicación Fullstack (Nuxt, Nitro, TypeScript, Auth, Permisos)
[          ] Nivel 5 — Sistemas y Robustez (Testing, Seguridad, Caching, Realtime, Go para networking)
[          ] Nivel 6 — Producto & Producción (Docker, Linux, Deploy, Monitoreo)
```

---

## Índice de Documentación (`docs/`)

### HTTP & Networking
- [`docs/http/01-modelo-cliente-servidor.md`](docs/http/01-modelo-cliente-servidor.md) — Modelo Cliente-Servidor, ciclo Request/Response y componentes HTTP básicos.

### Backend & Arquitectura
- [`docs/backend/01-modelado-y-colecciones-en-memoria.md`](docs/backend/01-modelado-y-colecciones-en-memoria.md) — Modelado de contratos (`interface`), estado en memoria y entrega de colecciones.

---

## Registro de Estado de Aprendizaje

| Concepto / Habilidad | Nivel de Dominio | Fecha de Inicio | Contextos Aplicados |
| :--- | :--- | :--- | :--- |
| **Modelo Cliente-Servidor** | Practiced | 2026-09-05 | Petición de catálogo en navegador |
| **Ciclo Request / Response** | Practiced | 2026-09-05 | Identificación de `GET /productos` y `Status Code + Body` |
| **Tipado en TypeScript** | Practiced | 2026-09-05 | Interfaz `Product` y colecciones en memoria |
| **Flujo de Ejecución & Retornos** | Practiced | 2026-09-05 | Análisis de retornos tempranos y bucles en `getProducts` |

> **Escala de Dominio:**
> - `Learning`: Concepto introducido; guiado.
> - `Practiced`: Se resolvió con preguntas orientadoras.
> - `Comfortable`: Puede explicarlo y detectar errores con mínima ayuda.
> - `Independent`: Lo aplica de forma autónoma en nuevos contextos.
