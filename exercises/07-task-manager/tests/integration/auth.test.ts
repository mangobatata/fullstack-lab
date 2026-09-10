import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { db } from "/home/brite/repos/fullstack-lab/exercises/07-task-manager/server/db";
import { usersTable } from "/home/brite/repos/fullstack-lab/exercises/07-task-manager/server/db/schema";
import { eq } from "drizzle-orm";

let baseUrl = "http://localhost:3000";

afterAll(async () => {
  await db.delete(usersTable);
});

beforeAll(async () => {
  await db.delete(usersTable);
  const [user] = await db
    .insert(usersTable)
    .values({
      name: "Test User",
      email: "test@example.com",
      passwordHash: "$argon2id$v=19$m=65536,p=4,t=3$testhashfortesting",
    })
    .returning();
});

describe("Auth API", () => {
  describe("POST /api/auth/register", () => {
    it("debe registrar un nuevo usuario y devolver 201 sin passwordHash", async () => {
      const body = {
        name: "Test User 2",
        email: "test2@example.com",
        password: "password123",
      };

      const res = await fetch(`${baseUrl}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data).toHaveProperty("name", "Test User 2");
      expect(data).toHaveProperty("email", "test2@example.com");
      expect(data).not.toHaveProperty("passwordHash");
    });

    it("debe retornar 409 si el email ya existe", async () => {
      const body = {
        name: "Test User 3",
        email: "test2@example.com",
        password: "password123",
      };

      await fetch(`${baseUrl}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const res = await fetch(`${baseUrl}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      expect(res.status).toBe(409);
    });
  });

  describe("POST /api/auth/login", () => {
    it("debe loguear y devolver set-cookie", async () => {
      const res = await fetch(`${baseUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "test@example.com",
          password: "password123",
        }),
      });

      expect(res.status).toBe(200);
      const setCookie = res.headers.get("set-cookie");
      expect(setCookie).toBeTruthy();
      expect(setCookie).toContain("nuxt-session");
    });

    it("debe fallar con 401 credenciales inválidas", async () => {
      const res = await fetch(`${baseUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "test@example.com",
          password: "wrongpassword",
        }),
      });

      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.message).toBe("Invalid credentials.");
    });

    it("debe fallar con 401 email no existente", async () => {
      const res = await fetch(`${baseUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "nonexistent@example.com",
          password: "whatever",
        }),
      });

      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.message).toBe("Invalid credentials.");
    });
  });

  describe("GET /api/auth/me", () => {
    let loginCookie: string | null = null;

    beforeAll(async () => {
      const res = await fetch(`${baseUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "test@example.com",
          password: "password123",
        }),
      });
      loginCookie = res.headers.get("set-cookie")?.split(";")[0];
    });

    it("debe devolver usuario logueado si hay cookie", async () => {
      const res = await fetch(`${baseUrl}/api/auth/me`, {
        headers: {
          "Content-Type": "application/json",
          Cookie: loginCookie || "",
        },
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toHaveProperty("user");
      expect(data.user).toHaveProperty("email", "test@example.com");
    });

    it("debe devolver 401 si no hay cookie", async () => {
      const res = await fetch(`${baseUrl}/api/auth/me`, {
        headers: { "Content-Type": "application/json" },
      });

      expect(res.status).toBe(401);
    });
  });

  describe("POST /api/auth/logout", () => {
    let loginCookie: string | null = null;

    beforeAll(async () => {
      const res = await fetch(`${baseUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "test@example.com",
          password: "password123",
        }),
      });
      loginCookie = res.headers.get("set-cookie")?.split(";")[0];
    });

    it("debe hacer logout y clear cookie", async () => {
      const res = await fetch(`${baseUrl}/api/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: loginCookie || "",
        },
      });

      expect(res.status).toBe(200);
      const setCookie = res.headers.get("set-cookie");
      expect(setCookie).toBeTruthy();
    });

    it("deve devolver 401 en /api/auth/me después de logout", async () => {
      const res = await fetch(`${baseUrl}/api/auth/me`, {
        headers: {
          "Content-Type": "application/json",
          Cookie: loginCookie || "",
        },
      });

      expect(res.status).toBe(401);
    });
  });
});