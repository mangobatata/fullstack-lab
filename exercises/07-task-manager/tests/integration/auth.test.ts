import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "../../server/db";
import { usersTable } from "../../server/db/schema";

const baseUrl = process.env.TEST_BASE_URL ?? "http://localhost:3000";
const runId = randomUUID();
const email = `auth-${runId}@example.com`;
const duplicateEmail = `duplicate-${runId}@example.com`;
const password = "Test-password-123!";
let loginCookie = "";

function request(path: string, init: RequestInit = {}) {
  return fetch(new URL(`/api/${path}`, baseUrl), {
    ...init,
    headers: { "Content-Type": "application/json", ...(init.headers ?? {}) },
    signal: AbortSignal.timeout(10_000),
  });
}
const body = (value: unknown): RequestInit => ({ body: JSON.stringify(value) });
const cookieFrom = (response: Response) =>
  response.headers.getSetCookie().find((v) => v.startsWith("nuxt-session="))?.split(";")[0] ?? "";

beforeAll(async () => {
  for (const [name, userEmail] of [["Auth User", email], ["Duplicate", duplicateEmail]]) {
    const response = await request("auth/register", { method: "POST", ...body({ name, email: userEmail, password }) });
    expect(response.status).toBe(201);
  }
});

afterAll(async () => {
  await db.delete(usersTable).where(eq(usersTable.email, email));
  await db.delete(usersTable).where(eq(usersTable.email, duplicateEmail));
});

describe("Auth API", () => {
  it("registra, normaliza email y no expone passwordHash", async () => {
    const newEmail = `new-${runId}@example.com`;
    const response = await request("auth/register", { method: "POST", ...body({ name: "New User", email: ` ${newEmail.toUpperCase()} `, password }) });
    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({ name: "New User", email: newEmail });
    const [stored] = await db.select().from(usersTable).where(eq(usersTable.email, newEmail));
    expect(stored?.passwordHash).toBeTruthy();
    expect(stored?.passwordHash).not.toBe(password);
    await db.delete(usersTable).where(eq(usersTable.email, newEmail));
  });

  it("rechaza duplicados y body inválido", async () => {
    expect((await request("auth/register", { method: "POST", ...body({ name: "Duplicate", email: duplicateEmail, password }) })).status).toBe(409);
    expect((await request("auth/register", { method: "POST", ...body({ name: "A", email: "bad", password: "short" }) })).status).toBe(400);
  });

  it("loguea, devuelve campos públicos y establece cookie", async () => {
    const response = await request("auth/login", { method: "POST", ...body({ email, password }) });
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.user).toEqual({ id: expect.any(Number), name: "Auth User", email });
    expect(data).not.toHaveProperty("passwordHash");
    loginCookie = cookieFrom(response);
    expect(loginCookie).toContain("nuxt-session=");
  });

  it.each([["missing", `missing-${runId}@example.com`], ["wrong password", email]])("rechaza %s con 401 genérico", async (_label, loginEmail) => {
    const response = await request("auth/login", { method: "POST", ...body({ email: loginEmail, password: _label === "wrong password" ? "Wrong-password-123!" : password }) });
    expect(response.status).toBe(401);
    expect((await response.json()).message).toBe("Invalid credentials.");
  });

  it("rechaza login inválido y /me sin cookie", async () => {
    expect((await request("auth/login", { method: "POST", ...body({ email: "bad", password: "short" }) })).status).toBe(400);
    expect((await request("auth/me")).status).toBe(401);
  });

  it("devuelve /me con cookie y logout la invalida", async () => {
    const me = await request("auth/me", { headers: { Cookie: loginCookie } });
    expect(me.status).toBe(200);
    expect(await me.json()).toEqual({ user: { id: expect.any(Number), name: "Auth User", email } });
    const logout = await request("auth/logout", { method: "POST", headers: { Cookie: loginCookie } });
    expect(logout.status).toBe(200);
    const clearedCookie = cookieFrom(logout);
    expect(clearedCookie).toContain("nuxt-session=");
    expect((await request("auth/me", { headers: { Cookie: clearedCookie } })).status).toBe(401);
  });
});
