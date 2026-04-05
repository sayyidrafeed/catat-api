import { afterAll, describe, expect, test, mock } from "bun:test";
import * as HttpStatus from "stoker/http-status-codes";

// Mock Service
mock.module("../profile.service", () => ({
  getProfile: mock(() => ({
    id: "user-1",
    name: "John Doe",
    email: "john@example.com",
    image: null,
  })),
  updateProfile: mock(() => ({
    id: "user-1",
    name: "John Updated",
    email: "john@example.com",
    image: null,
  })),
  deleteAccount: mock(() => ({ id: "user-1" })),
}));

// Mock Auth Middleware
mock.module("@/middlewares/auth.middleware", () => ({
  requireAuth: () => (c: unknown, next: () => void) => {
    (c as { set: (key: string, value: { id: string }) => void }).set("user", {
      id: "user-1",
    });
    return next();
  },
}));

const { default: app } = await import("@/app");

describe("profile.handlers", () => {
  afterAll(() => {
    mock.restore();
  });

  test("GET /api/me returns 200", async () => {
    const res = await app.request("/api/me");
    expect(res.status).toBe(HttpStatus.OK);
    const body = (await res.json()) as { id: string };
    expect(body.id).toBe("user-1");
  });

  test("PATCH /api/me returns 200", async () => {
    const res = await app.request("/api/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "John Updated" }),
    });
    expect(res.status).toBe(HttpStatus.OK);
    const body = (await res.json()) as { name: string };
    expect(body.name).toBe("John Updated");
  });

  test("PATCH /api/me returns 422 for invalid body", async () => {
    const res = await app.request("/api/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: "not-a-url" }),
    });
    expect(res.status).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
  });

  test("DELETE /api/me returns 204", async () => {
    const res = await app.request("/api/me", {
      method: "DELETE",
    });
    expect(res.status).toBe(HttpStatus.NO_CONTENT);
  });
});
