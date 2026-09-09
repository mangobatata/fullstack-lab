import { eq } from "drizzle-orm";
import { db } from "~~/server/db";
import { usersTable } from "~~/server/db/schema";

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event);

  const [user] = await db
    .select({
      id: usersTable.id,
      name: usersTable.name,
      email: usersTable.email,
    })
    .from(usersTable)
    .where(eq(usersTable.id, session.user.id))
    .limit(1);

  if (!user) {
    await clearUserSession(event);

    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
      message: "La sesión no corresponde a un usuario válido.",
    });
  }

  return {
    user,
  };
});
