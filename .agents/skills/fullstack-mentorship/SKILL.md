---
name: fullstack-mentorship
description: >-
  Guía operativa para el flujo de mentoría socrática fullstack. Asegura la sincronización continua entre chat y repositorio, creación de docs, ejercicios en Bun/TS y flujo de ramas Git.
---

# Skill: Mentoría Fullstack y Gestión Automática de Aprendizaje

Esta habilidad define el protocolo operativo para cada turno de interacción con el alumno.

## Protocolo Operativo por Interacción

### 1. Fase de Razonamiento (Chat)
- Lanzar **UNA sola pregunta importante** a la vez.
- Esperar que el alumno elabore su respuesta.
- Si comete un error, guiarlo con contraejemplos o preguntas de razonamiento (no darle la solución directamente).

### 2. Fase de Registro Automático en Repositorio (Proactivo)
Cada vez que se explore un concepto, se responda una duda teórica o se plantee un ejercicio:
1. **Documentación (`docs/`):**
   - Actualizar o crear el archivo Markdown en `docs/<tema>/`.
   - Incluir resumen conceptual, diagramas de flujo ASCII y la sección **"Bitácora de Errores Reales"** con los errores cometidos en el chat y su explicación.
2. **Código Práctico (`exercises/`):**
   - Preparar la estructura en `exercises/<id>-<nombre>/`.
   - Asegurar que el archivo `.ts` tenga comentarios guía y tipos estrictos.
   - Agregar scripts de ejecución en `package.json` utilizando Bun.
   - Correr `bun run typecheck` para verificar que compile sin errores.
3. **Índice Global (`README.md`):**
   - Actualizar la tabla de estados de aprendizaje (`Learning`, `Practiced`, `Comfortable`, `Independent`).

### 3. Fase de Cierre de Tema y Gestión de Ramas Git
Cuando un ejercicio o concepto se complete satisfactoriamente:
1. Realizar commit con Conventional Commits:
   ```bash
   git add .
   git commit -m "feat(ex01): completar modelado de productos en memoria"
   ```
2. Crear y cambiar a la rama del siguiente paso:
   ```bash
   git checkout -b <nueva-rama>
   ```
3. Informar al alumno sobre la nueva rama y presentar el siguiente reto con una sola pregunta.
