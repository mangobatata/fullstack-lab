import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "~~/server/db";
import { projectsTable, tasksTable } from "~~/server/db/schema";

const idSchema = z.coerce
  .number()
  .int("El ID debe ser un entero.")
  .positive("El ID debe ser positivo.");

export default defineEventHandler(async (event) => {
  // 1. Exigir una sesión válida
  const session = await requireUserSession(event);

  // 2. Leer los IDs de la URL
  const rawProjectId = getRouterParam(event, "id");
  const rawTaskId = getRouterParam(event, "taskId");

  // 3. Validar projectId
  const projectIdResult = idSchema.safeParse(rawProjectId);

  if (!projectIdResult.success) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message:
        projectIdResult.error.issues[0]?.message ??
        "El ID del proyecto no es válido.",
    });
  }

  // 4. Validar taskId
  const taskIdResult = idSchema.safeParse(rawTaskId);

  if (!taskIdResult.success) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message:
        taskIdResult.error.issues[0]?.message ??
        "El ID de la tarea no es válido.",
    });
  }

  const projectId = projectIdResult.data;
  const taskId = taskIdResult.data;

  // 5. Comprobar que el proyecto pertenece al usuario
  const [project] = await db
    .select({
      id: projectsTable.id,
    })
    .from(projectsTable)
    .where(
      and(
        eq(projectsTable.id, projectId),
        eq(projectsTable.userId, session.user.id),
      ),
    )
    .limit(1);

  if (!project) {
    throw createError({
      statusCode: 404,
      statusMessage: "Not Found",
      message: "Proyecto no encontrado.",
    });
  }

  // 6. Borrar la tarea únicamente si pertenece a ese proyecto
  const [deletedTask] = await db
    .delete(tasksTable)
    .where(and(eq(tasksTable.id, taskId), eq(tasksTable.projectId, projectId)))
    .returning({
      id: tasksTable.id,
    });

  // 7. No existe una tarea con ese ID dentro del proyecto
  if (!deletedTask) {
    throw createError({
      statusCode: 404,
      statusMessage: "Not Found",
      message: "Tarea no encontrada.",
    });
  }

  // 8. Eliminación exitosa sin body
  setResponseStatus(event, 204);
  return null;
});
