import { z } from "zod";
import { db } from "~~/server/db";
import { projectsTable } from "~~/server/db/schema";
import { and, eq } from "drizzle-orm";

const projectIdSchema = z.coerce
  .number()
  .int("El ID debe ser un entero.")
  .positive("El ID debe ser positivo.");

export default defineEventHandler(async (event) => {
  // 1. Exigir una sesión válida.
  const session = await requireUserSession(event);

  // 2. Obtener el ID desde la URL.
  const rawProjectId = getRouterParam(event, "id");

  // 3. Convertirlo y validarlo.
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

  // 4. Eliminar solamente si el proyecto pertenece al usuario.
  const [deletedProject] = await db
    .delete(projectsTable)
    .where(
      and(
        eq(projectsTable.id, projectId),
        eq(projectsTable.userId, session.user.id),
      ),
    )
    .returning({
      id: projectsTable.id,
    });

  // 5. Ninguna fila eliminada: no existe o pertenece a otro usuario.
  if (!deletedProject) {
    throw createError({
      statusCode: 404,
      statusMessage: "Not Found",
      message: "Proyecto no encontrado.",
    });
  }

  // 6. Eliminación exitosa sin contenido de respuesta.
  setResponseStatus(event, 200);

  return { message: "Proyecto borrado." };
});

// 1. Exigir sesión válida.
// 2. Leer y validar el ID de la URL.
// 3. Eliminar donde:
//    - projects.id sea projectId
//    - projects.userId sea session.user.id
// 4. Si no eliminó ninguna fila, responder 404.
// 5. Si eliminó, responder 204 sin body.
