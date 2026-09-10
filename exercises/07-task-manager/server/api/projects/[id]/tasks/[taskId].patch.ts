import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "~~/server/db";
import { projectsTable, tasksTable } from "~~/server/db/schema";

const bodySchema = z
  .strictObject({
    title: z.string().trim().min(2).max(255).optional(),
    description: z.string().trim().max(5000).nullable().optional(),
    status: z.enum(["todo", "doing", "done"]).optional(),
  })
  .refine(
    (body) =>
      body.title !== undefined ||
      body.description !== undefined ||
      body.status !== undefined,
    {
      message: "Debe enviar al menos un campo para actualizar.",
    },
  );

const projectIdSchema = z.coerce
  .number()
  .int("El ID debe ser un entero.")
  .positive("El ID debe ser positivo.");

const taskIdSchema = z.coerce
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

  const rawTaskId = getRouterParam(event, "taskId");
  const taskIdResult = taskIdSchema.safeParse(rawTaskId);

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

  if (!taskIdResult.success) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message:
        taskIdResult.error.issues[0]?.message ?? "El ID del task no es válido.",
    });
  }

  const taskId = taskIdResult.data;

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

  const { title, description, status } = bodyResult.data;

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
  // 6. Actualizar solamente la tarea que pertenece al proyecto validado
  const [updatedTask] = await db
    .update(tasksTable)
    .set({
      title,
      description,
      status,
      updatedAt: new Date(),
    })
    .where(and(eq(tasksTable.id, taskId), eq(tasksTable.projectId, projectId)))
    .returning();

  // 7. La tarea no existe dentro de ese proyecto
  if (!updatedTask) {
    throw createError({
      statusCode: 404,
      statusMessage: "Not Found",
      message: "Tarea no encontrada.",
    });
  }

  // 8. Actualización exitosa
  setResponseStatus(event, 200);

  return updatedTask;
});

// 1. Verificar sesión
//    → sin sesión: 401

// 2. Leer projectId y taskId desde la URL
//    → convertir y validar ambos con Zod
//    → alguno inválido: 400

// 3. Leer y validar el body
//    → title opcional
//    → description opcional
//    → status opcional
//    → exigir al menos un campo
//    → body inválido o vacío: 400

// 4. Buscar el proyecto donde:
//    project.id = projectId
//    AND project.userId = session.user.id

// 5. Si no existe:
//    → 404

// 6. Actualizar la tarea donde:
//    task.id = taskId
//    AND task.projectId = projectId

// 7. Modificar solamente los campos enviados
//    → title
//    → description
//    → status
//    → updatedAt: new Date()

// 8. Recuperar la fila usando returning()

// 9. Si no se actualizó ninguna fila:
//    → 404, la tarea no existe dentro de ese proyecto

// 10. Devolver 200 con la tarea actualizada
