import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "~~/server/db";
import { projectsTable, tasksTable } from "~~/server/db/schema";

const bodySchema = z.strictObject({
  title: z
    .string()
    .trim()
    .min(2, "El título debe tener al menos 2 caracteres.")
    .max(255, "El título no puede superar los 255 caracteres."),

  description: z
    .string()
    .trim()
    .min(5, "La descripción debe tener al menos 5 caracteres.")
    .max(1000, "La descripción no puede superar los 1000 caracteres.")
    .optional(),
});

const projectIdSchema = z.coerce
  .number()
  .int("El ID debe ser un entero.")
  .positive("El ID debe ser positivo.");

export default defineEventHandler(async (event) => {
  // 1. Verificar sesión
  const session = await requireUserSession(event);

  if (!session?.user?.id) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
      message: "Inicie sesión para continuar.",
    });
  }

  // 2. Leer y validar projectId
  const rawProjectId = getRouterParam(event, "id");

  const projectIdResult = projectIdSchema.safeParse(rawProjectId);

  if (!projectIdResult.success) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message:
        projectIdResult.error.issues[0]?.message ??
        "El ID del proyecto no es válido.",
    });
  }

  const projectId = projectIdResult.data;

  // 3. Leer y validar body
  const body = await readBody(event);

  const bodyResult = bodySchema.safeParse(body);

  if (!bodyResult.success) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: bodyResult.error.issues[0]?.message ?? "Datos inválidos.",
    });
  }

  const { title, description } = bodyResult.data;

  // 4. Buscar proyecto perteneciente al usuario
  const [project] = await db
    .select()
    .from(projectsTable)
    .where(
      and(
        eq(projectsTable.id, projectId),
        eq(projectsTable.userId, session.user.id),
      ),
    );

  // 5. Proyecto inexistente o no pertenece al usuario
  if (!project) {
    throw createError({
      statusCode: 404,
      statusMessage: "Not Found",
      message: "Proyecto no encontrado.",
    });
  }

  // 6. Crear task
  const task: typeof tasksTable.$inferInsert = {
    projectId: project.id,
    title,
    description,
    status: "todo",
  };

  const [createdTask] = await db.insert(tasksTable).values(task).returning();

  if (!createdTask) {
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
      message: "No se pudo crear la tarea.",
    });
  }

  setResponseStatus(event, 201);

  return createdTask;
});

// 1. Verificar sesión
//    → si no existe: 401

// 2. Leer projectId desde params
//    → validar con Zod
//    → si es inválido: 400

// 3. Leer body
//    → validar title
//    → description opcional
//    → si es inválido: 400

// 4. Buscar proyecto donde:
//    project.id = projectId
//    AND
//    project.userId = session.user.id

// 5. Si no existe
//    → 404

// 6. Insertar task:
//    projectId: project.id
//    title: body.title
//    description: body.description
//    status: "todo"

// 7. Recuperar fila con returning()

// 8. setResponseStatus(event, 201)

// 9. return task
