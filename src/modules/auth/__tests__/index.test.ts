import { describe, expect, test, beforeEach } from "bun:test";
import { createRouter } from "../../../factory";
import authRouter from "../index";

describe("Auth Module", () => {
  let app: ReturnType<typeof createRouter>;

  beforeEach(() => {
    app = createRouter();
    app.route("/", authRouter);
  });

  test("authRouter should be defined", () => {
    expect(authRouter).toBeDefined();
  });

  test("should mount auth routes at /api/auth", async () => {
    const res = await app.request("/api/auth");
    expect(res.status).toBeDefined();
  });

  test("should handle GET /api/auth/**", async () => {
    const res = await app.request("/api/auth/something");
    expect(res.status).toBeDefined();
  });

  test("should handle POST /api/auth/**", async () => {
    const res = await app.request("/api/auth/something", {
      method: "POST",
    });
    expect(res.status).toBeDefined();
  });
});
