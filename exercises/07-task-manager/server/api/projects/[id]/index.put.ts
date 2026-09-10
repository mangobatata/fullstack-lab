import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import { db } from "~~/server/db";
import { projectsTable } from "~~/server/db/schema";
import { and, eq } from "drizzle-orm";
import { getPostgresErrorCode } from "../../utils/db-error";

const bodySchema = z.strictObject({
  projectName: z
    .string()
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres.")
    .max(255, "El nombre no puede superar los 255 caracteres."),
});

const projectIdSchema = z.coerce
  .number()
  .int("El ID debe ser un entero.")
  .positive("El ID debe ser positivo.");

type ProjectBody = z.infer<typeof bodySchema>;

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event);
  if (!session?.user?.id) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
      message: "Inicie sesión para continuar.",
    });
  }

  const body = await readBody<ProjectBody>(event);
  const result = bodySchema.safeParse(body);

  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: result.error.issues[0]?.message ?? "Datos inválidos.",
    });
  }

  const projectIdResult = projectIdSchema.safeParse(event.context.params?.id);

  if (!projectIdResult.success) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message:
        projectIdResult.error.issues[0]?.message ?? "ID de proyecto inválido.",
    });
  }

  const { projectName } = result.data;
  const projectId = projectIdResult.data;

  const [project] = await db
    .select()
    .from(projectsTable)
    .where(
      and(
        eq(projectsTable.id, projectId),
        eq(projectsTable.userId, session.user.id),
      ),
    );

  if (!project) {
    throw createError({ statusCode: 404, message: "Proyecto no encontrado." });
  }

  try {
    const updatedProject = await db
      .update(projectsTable)
      .set({ projectName: projectName })
      .where(eq(projectsTable.id, projectId));

    setResponseStatus(event, 200);
    return updatedProject;
  } catch (error: unknown) {
    const errorCode = getPostgresErrorCode(error);

    if (errorCode === "23505") {
      throw createError({
        statusCode: 409,
        statusMessage: "Conflict",
        message: "Ya existe un proyecto con un slug igual, intentá de nuevo.",
      });
    }

    throw error;
  }
});
// verifico session de usuario
// selecciono el projecto del user por el id del proyecto y del usuario
// lee el body y valido
// actualizo el proyecto con los datos del body
