import { afterAll, describe, expect, it, vi } from "vitest";
import { randomUUID } from "node:crypto";
import { inArray } from "drizzle-orm";
import { db } from "../../server/db";
import { usersTable } from "../../server/db/schema";

// Nuxt puede compilar el endpoint en la primera petición al servidor de desarrollo.
vi.setConfig({ testTimeout: 30_000, hookTimeout: 15_000 });

// Ejecutar con Nuxt y PostgreSQL levantados sobre la misma DATABASE_URL.
const baseUrl = process.env.TEST_BASE_URL ?? "http://localhost:3000";
const createdEmails: string[] = [];
const password = "Test-password-123!";
const cookieName = "nuxt-session";

function request(path: string, body?: unknown, cookie?: string) {
  return fetch(new URL(`/api/auth/${path}`, baseUrl), {
    method: path === "me" ? "GET" : "POST",
    headers: {
      ...(body === undefined ? {} : { "Content-Type": "application/json" }),
      ...(cookie ? { Cookie: cookie } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(10_000),
    redirect: "manual",
  });
}

function newUser() {
  const user = {
    name: "Test User",
    email: `auth-${randomUUID()}@example.com`,
    password,
  };
  createdEmails.push(user.email);
  return user;
}

async function register() {
  const user = newUser();
  const response = await request("register", user);
  expect(response.status).toBe(201);
  return user;
}

function sessionCookie(response: Response) {
  const header = response.headers.getSetCookie().find(
    (value) => value.startsWith(`${cookieName}=`),
  );
  expect(header).toBeDefined();
  if (!header) throw new Error("La respuesta no contiene la cookie de sesión");
  return header;
}

async function login() {
  const user = await register();
  const response = await request("login", {
    email: user.email,
    password: user.password,
  });
  expect(response.status).toBe(200);
  const cookie = sessionCookie(response).split(";")[0]!;
  return { user, response, cookie };
}

afterAll(async () => {
  try {
    // Nunca borrar usuarios ajenos a esta ejecución (hay cascadas a proyectos).
    if (createdEmails.length) {
      await db.delete(usersTable).where(inArray(usersTable.email, createdEmails));
    }
  } finally {
    await db.$client.end();
  }
});

describe("POST /api/auth/register", () => {
  it("registra y devuelve únicamente los datos públicos", async () => {
    const user = newUser();
    const response = await request("register", user);
    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({ name: user.name, email: user.email });
  });

  it("normaliza el nombre y el email", async () => {
    const user = newUser();
    const response = await request("register", {
      ...user, name: "  Test User  ", email: `  ${user.email.toUpperCase()}  `,
    });
    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({ name: user.name, email: user.email });
  });

  it("rechaza un email duplicado incluso con mayúsculas y espacios", async () => {
    const user = await register();
    const response = await request("register", {
      ...user, email: ` ${user.email.toUpperCase()} `,
    });
    expect(response.status).toBe(409);
  });

  it.each([
    ["campos faltantes", {}],
    ["nombre corto", { name: "A", email: "invalid@example.com", password }],
    ["email inválido", { name: "Test", email: "invalid", password }],
    ["contraseña corta", { name: "Test", email: "invalid@example.com", password: "1234567" }],
    ["tipo inválido", { name: 123, email: "invalid@example.com", password }],
  ])("devuelve 400 para %s", async (_label, body) => {
    expect((await request("register", body)).status).toBe(400);
  });
});

describe("POST /api/auth/login", () => {
  it("autentica y entrega una cookie HttpOnly con usuario público", async () => {
    const { user, response } = await login();
    const header = sessionCookie(response);
    expect(header).toMatch(/;\s*HttpOnly/i);
    expect(header).toMatch(/;\s*SameSite=Lax/i);
    expect(await response.json()).toEqual({
      message: "Login successful",
      user: { id: expect.any(Number), name: user.name, email: user.email },
    });
  });

  it("acepta el email normalizado", async () => {
    const user = await register();
    const response = await request("login", {
      email: ` ${user.email.toUpperCase()} `, password,
    });
    expect(response.status).toBe(200);
    sessionCookie(response);
  });

  it("rechaza contraseña incorrecta y usuario inexistente con el mismo error", async () => {
    const user = await register();
    for (const credentials of [
      { email: user.email, password: "Wrong-password-123!" },
      { email: `missing-${randomUUID()}@example.com`, password },
    ]) {
      const response = await request("login", credentials);
      expect(response.status).toBe(401);
      expect(await response.json()).toMatchObject({ message: "Invalid credentials." });
      expect(response.headers.get("set-cookie")).toBeNull();
    }
  });

  it.each([{}, { email: "invalid", password }, { email: "test@example.com", password: "short" }])(
    "rechaza credenciales mal formadas: %j", async (body) => {
      expect((await request("login", body)).status).toBe(400);
    },
  );
});

describe("GET /api/auth/me", () => {
  it("devuelve el usuario de la sesión sin el hash", async () => {
    const { user, cookie } = await login();
    const response = await request("me", undefined, cookie);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      user: { id: expect.any(Number), name: user.name, email: user.email },
    });
  });

  it("rechaza peticiones sin cookie", async () => {
    expect((await request("me")).status).toBe(401);
  });

  it("rechaza una cookie inválida", async () => {
    expect((await request("me", undefined, `${cookieName}=invalid`)).status).toBe(401);
  });

  it("rechaza la sesión de un usuario eliminado", async () => {
    const { user, cookie } = await login();
    await db.delete(usersTable).where(inArray(usersTable.email, [user.email]));
    expect((await request("me", undefined, cookie)).status).toBe(401);
  });
});

describe("POST /api/auth/logout", () => {
  it("vacía la cookie y permite continuar sin sesión", async () => {
    const { cookie } = await login();
    const response = await request("logout", undefined, cookie);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ message: "Logout successful" });
    const header = sessionCookie(response);
    expect(header).toMatch(/^nuxt-session=;/);
    // Simular que el navegador reemplaza la cookie con el valor recibido.
    expect((await request("me", undefined, header.split(";")[0]!)).status).toBe(401);
  });

  it("permite cerrar sesión aunque no haya cookie", async () => {
    expect((await request("logout")).status).toBe(200);
  });
});
