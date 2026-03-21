import { describe, expect, test, mock, beforeEach } from "bun:test";
import { createRouter } from "@/factory";
import { requireAuth, requireRole } from "../auth.middleware";
import { AppError } from "@/lib/errors";

mock.module("@/auth", () => ({
  auth: {
    api: {
      getSession: mock(),
    },
  },
}));

import { auth } from "@/auth";

type MockFunc = {
  mockReset: () => void;
  mockResolvedValue: (value: unknown) => void;
};

describe("Authentication Middlewares", () => {
  let app: ReturnType<typeof createRouter>;

  beforeEach(() => {
    app = createRouter();
    app.onError((err, c) => {
      if (err instanceof AppError) {
        return c.text(
          err.message,
          err.statusCode as 401 | 403 | 404 | 409 | 422 | 500,
        );
      }
      return c.text("Internal Server Error", 500);
    });
    (auth.api.getSession as unknown as MockFunc).mockReset();
  });

  describe("requireAuth", () => {
    test("should throw UnauthorizedError if no session is found", async () => {
      (auth.api.getSession as unknown as MockFunc).mockResolvedValue(null);

      app.use("/protected", requireAuth());
      app.get("/protected", (c) => c.text("ok"));

      const res = await app.request("/protected");
      expect(res.status).toBe(401);
      expect(await res.text()).toBe("Authentication required. Please log in.");
    });

    test("should throw UnauthorizedError if session is empty", async () => {
      (auth.api.getSession as unknown as MockFunc).mockResolvedValue({
        user: null,
        session: null,
      });

      app.use("/protected", requireAuth());
      app.get("/protected", (c) => c.text("ok"));

      const res = await app.request("/protected");
      expect(res.status).toBe(401);
    });

    test("should populate context and continue if session is valid", async () => {
      const mockSession = {
        user: { id: "1", email: "test@example.com" },
        session: { id: "s1", userId: "1" },
      };
      (auth.api.getSession as unknown as MockFunc).mockResolvedValue(
        mockSession,
      );

      app.use("/protected", requireAuth());
      app.get("/protected", (c) => {
        const user = c.get("user");
        const session = c.get("session");
        return c.json({ user, session });
      });

      const res = await app.request("/protected");
      expect(res.status).toBe(200);
      const data = (await res.json()) as {
        user: { id: string };
        session: { id: string };
      };
      expect(data.user.id).toBe("1");
      expect(data.session.id).toBe("s1");
    });

    test("should pass user and session to handler", async () => {
      const mockSession = {
        user: { id: "user-123", email: "admin@example.com", name: "Admin" },
        session: { id: "session-456", userId: "user-123" },
      };
      (auth.api.getSession as unknown as MockFunc).mockResolvedValue(
        mockSession,
      );

      app.use("/profile", requireAuth());
      app.get("/profile", (c) => {
        const user = c.get("user");
        return c.json({ user });
      });

      const res = await app.request("/profile");
      expect(res.status).toBe(200);
      const body = (await res.json()) as {
        user: { id: string; email: string };
      };
      expect(body.user.email).toBe("admin@example.com");
    });
  });

  describe("requireRole", () => {
    test("should throw UnauthorizedError if no user in context", async () => {
      app.use("/admin", requireRole("admin"));
      app.get("/admin", (c) => c.text("welcome admin"));

      const res = await app.request("/admin");
      expect(res.status).toBe(401);
    });

    test("should throw UnauthorizedError if requireAuth not called first", async () => {
      const mockSession = {
        user: { id: "1", email: "test@example.com" },
        session: { id: "s1", userId: "1" },
      };
      (auth.api.getSession as unknown as MockFunc).mockResolvedValue(
        mockSession,
      );

      app.use("/admin", requireRole("admin"));
      app.get("/admin", (c) => c.text("welcome admin"));

      const res = await app.request("/admin");
      expect(res.status).toBe(401);
    });

    test("should pass if user has correct role", async () => {
      const mockSession = {
        user: { id: "1", email: "test@example.com", role: "admin" },
        session: { id: "s1", userId: "1" },
      };
      (auth.api.getSession as unknown as MockFunc).mockResolvedValue(
        mockSession,
      );

      app.use("/admin", requireAuth(), requireRole("admin"));
      app.get("/admin", (c) => c.text("welcome admin"));

      const res = await app.request("/admin");
      expect(res.status).toBe(200);
      expect(await res.text()).toBe("welcome admin");
    });

    test("should throw ForbiddenError if user has wrong role", async () => {
      const mockSession = {
        user: { id: "1", email: "test@example.com", role: "user" },
        session: { id: "s1", userId: "1" },
      };
      (auth.api.getSession as unknown as MockFunc).mockResolvedValue(
        mockSession,
      );

      app.use("/admin", requireAuth(), requireRole("admin"));
      app.get("/admin", (c) => c.text("welcome admin"));

      const res = await app.request("/admin");
      expect(res.status).toBe(403);
      expect(await res.text()).toBe("Permission denied: requires admin role.");
    });

    test("should pass for multiple roles", async () => {
      const mockSession = {
        user: { id: "1", email: "test@example.com", role: "moderator" },
        session: { id: "s1", userId: "1" },
      };
      (auth.api.getSession as unknown as MockFunc).mockResolvedValue(
        mockSession,
      );

      app.use("/moderate", requireAuth(), requireRole("moderator"));
      app.get("/moderate", (c) => c.text("welcome moderator"));

      const res = await app.request("/moderate");
      expect(res.status).toBe(200);
    });
  });
});
