import { and, asc, count, eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "~~/server/db";
import { projectsTable, tasksTable } from "~~/server/db/schema";

// Validar el ID del proyecto
const projectIdSchema = z.coerce
  .number()
  .int("El ID debe ser un entero.")
  .positive("El ID debe ser positivo.");

// Validar los parámetros de paginación
const paginationSchema = z.object({
  page: z.coerce
    .number()
    .int("La página debe ser un entero.")
    .positive("La página debe ser mayor a 0.")
    .default(1),

  limit: z.coerce
    .number()
    .int("El límite debe ser un entero.")
    .positive("El límite debe ser mayor a 0.")
    .max(100, "El límite máximo es 100.")
    .default(20),
});

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

  // 2. Leer projectId desde la URL
  const rawProjectId = getRouterParam(event, "id");

  // 3. Validar projectId
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

  // 4. Leer los query params
  const query = getQuery(event);

  // 5. Validar page y limit
  const paginationResult = paginationSchema.safeParse({
    page: query.page,
    limit: query.limit,
  });

  if (!paginationResult.success) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message:
        paginationResult.error.issues[0]?.message ??
        "Los parámetros de paginación no son válidos.",
    });
  }

  const { page, limit } = paginationResult.data;

  // 6. Convertir page a offset para PostgreSQL
  const offset = (page - 1) * limit;

  // 7. Buscar el proyecto y verificar que pertenezca al usuario
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
    );

  // 8. Si el proyecto no existe o pertenece a otro usuario
  if (!project) {
    throw createError({
      statusCode: 404,
      statusMessage: "Not Found",
      message: "Proyecto no encontrado.",
    });
  }

  // 9. Buscar las tasks paginadas y contar el total
  const [tasks, totalResult] = await Promise.all([
    db
      .select()
      .from(tasksTable)
      .where(eq(tasksTable.projectId, project.id))
      .orderBy(asc(tasksTable.id))
      .limit(limit)
      .offset(offset),

    db
      .select({
        total: count(),
      })
      .from(tasksTable)
      .where(eq(tasksTable.projectId, project.id)),
  ]);

  // 10. Obtener cantidad total de tasks
  const total = totalResult[0]?.total ?? 0;

  // 11. Calcular cantidad total de páginas
  const totalPages = Math.ceil(total / limit);

  // 12. Retornar tasks y datos de paginación
  return {
    data: tasks,

    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  };
});

// validar la session del usuario
// si no existe → 401

// leer projectId desde params
// validar projectId
// si es inválido → 400

// buscar el proyecto donde:
// project.id === projectId
// AND project.userId === session.user.id

// si no existe → 404

// buscar las tasks donde:
// task.projectId === project.id

// retornar las tasks
