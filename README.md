# 🧪 Fullstack Lab

Laboratorio personal de aprendizaje práctico para Ingeniería de Software y Desarrollo Fullstack.

Este repositorio no busca acumular tutoriales ni aplicaciones copiadas. Busca documentar el razonamiento necesario para diseñar, implementar, probar y depurar productos reales.

> **Principio central:** primero entender el problema; después elegir la herramienta.

## 🎯 Objetivo

Construir independencia técnica para crear:

- APIs REST y aplicaciones fullstack.
- Dashboards y productos multiusuario.
- Sistemas con PostgreSQL, roles y permisos.
- E-commerce pequeño y sistemas realtime.
- Integraciones externas, CLI cliente-servidor y SaaS.
- Productos seguros, testeables y listos para producción.

## 🧰 Stack

### Principal

TypeScript · Node.js · Nuxt · Vue · Nitro · PostgreSQL · SQL · HTTP · HTML/CSS · Git · Linux · Docker.

### Secundario

Go · Redis · WebSockets · OAuth · sistemas realtime.

## 🧠 Método de aprendizaje

Cada ejercicio sigue este ciclo:

```text
problema
  ↓
razonamiento e hipótesis
  ↓
pseudocódigo o diagrama
  ↓
implementación parcial
  ↓
prueba y debugging
  ↓
explicación del aprendizaje
```

La mentoría prioriza preguntas, intentos propios y debugging guiado. Los errores reales se documentan con su causa y corrección; no se inventan errores para completar una bitácora.

## 🗺️ Roadmap

```text
✅ Fundamentos de TypeScript y colecciones en memoria
✅ HTTP básico con node:http
✅ CRUD en memoria y validación
🚧 Nitro y routing por archivos
⬜ SQL y PostgreSQL
⬜ Task Manager fullstack con Nuxt/Vue
⬜ Autenticación, sesiones y autorización
⬜ Testing y seguridad aplicada
⬜ Redis, jobs y realtime
⬜ Deploy, Docker y producción
⬜ Go para networking y concurrencia
```

### Progresión de abstracciones

```text
node:http
  ↓  request, response, URL, headers, body, status
Nitro
  ↓  handlers, filesystem routing, errores y runtime portable
PostgreSQL
  ↓  SQL, constraints, relaciones y transacciones
Nuxt + Vue
  ↓  UI, SSR, formularios y estados de cliente
Producción
  ↓  auth, testing, seguridad, deploy y observabilidad
```

Node HTTP se usa como herramienta pedagógica para comprender qué ocurre debajo de Nitro. Nitro y Nuxt son las capas que usaremos para construir aplicaciones reales, no un reemplazo de los fundamentos.

## 📁 Organización

```text
fullstack-lab/
├── docs/              # Teoría, diagramas y bitácora de errores reales
├── exercises/         # Ejercicios incrementales con Bun/TypeScript/Nitro
├── AGENTS.md          # Reglas operativas del repositorio
├── package.json       # Scripts del laboratorio cuando corresponda
└── README.md          # Índice, roadmap y estado general
```

Cada ejercicio puede tener su propio `package.json` cuando necesita dependencias o runtime independiente, como el proyecto Nitro.

## 📚 Ejercicios y documentación

El trabajo práctico se organiza por ramas descriptivas:

- [`foundation/01-client-server-model`](https://github.com/mangobatata/fullstack-lab/tree/foundation/01-client-server-model) — Modelo cliente-servidor y fundamentos iniciales.
- [`exercise/02-api-http-bun`](https://github.com/mangobatata/fullstack-lab/tree/exercise/02-api-http-bun) — API HTTP mínima con Bun y `node:http`.
- [`exercise/03-api-responses-y-validacion`](https://github.com/mangobatata/fullstack-lab/tree/exercise/03-api-responses-y-validacion) — CRUD en memoria, validación y status codes.
- [`exercise/04-nitro-api`](https://github.com/mangobatata/fullstack-lab/tree/exercise/04-nitro-api) — Routing por archivos y handlers con Nitro.

La rama `main` funciona como índice estable. El desarrollo ocurre en ramas de tema o ejercicio y se integra mediante Pull Request.

## 🚀 Cómo trabajar con el repositorio

```bash
git clone git@github.com:mangobatata/fullstack-lab.git
cd fullstack-lab
git branch -a
git switch <rama-del-ejercicio>
```

En cada ejercicio:

1. Leer el README y la documentación relacionada.
2. Formular una hipótesis antes de escribir código.
3. Implementar una parte pequeña.
4. Ejecutar pruebas manuales y `bun run typecheck` cuando corresponda.
5. Registrar errores reales y decisiones.
6. Hacer commit convencional, push y Pull Request.

## 📊 Estados de progreso

| Estado | Significado |
| :--- | :--- |
| `Learning` | Concepto introducido; necesita guía. |
| `Practiced` | Resuelto con preguntas y práctica. |
| `Comfortable` | Puede aplicarlo y detectar errores con poca ayuda. |
| `Independent` | Puede usarlo en contextos nuevos de forma autónoma. |

El objetivo no es avanzar por cantidad de código, sino demostrar comprensión, transferencia y capacidad de debugging.

## 🛡️ Principios técnicos

- El frontend no decide permisos: el servidor valida inputs, ownership y autorización.
- La persistencia se distingue de la memoria del proceso.
- Las abstracciones se introducen cuando resuelven un problema concreto.
- La seguridad se aprende junto al flujo que protege.
- Se prefieren sistemas simples antes que arquitectura ceremonial.
- Se mide el aprendizaje por lo que se puede explicar y depurar, no solo por lo que compila.

## 📌 Estado actual

El laboratorio completó los fundamentos de productos en memoria, una API HTTP mínima y un CRUD validado con Node. El siguiente hito es repetir el mismo modelo con Nitro para observar qué responsabilidades abstrae el framework.

⭐ Aprender construyendo. 🧭 Entender antes de abstraer. 🛠️ Depurar antes de rendirse.
