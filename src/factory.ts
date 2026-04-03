import { OpenAPIHono } from "@hono/zod-openapi";
import type { User, Session } from "better-auth";
import { z } from "zod";

export interface AppEnv {
  Bindings: {
    // Bun bindings or env vars if not using singleton
  };
  Variables: {
    // Session and Auth Variables will be added here later
    user?: User | null;
    session?: Session | null;
  };
}

export const errorResponseSchema = z.object({
  success: z.literal(false),
  error: z.object({
    name: z.string(),
    message: z.string(),
    details: z.unknown().optional(),
  }),
});

export const createRouter = () => {
  return new OpenAPIHono<AppEnv>({
    strict: false,
    defaultHook: (result, c) => {
      if (!result.success) {
        return c.json(
          {
            success: false,
            error: {
              name: "VALIDATION_ERROR",
              message: "Validation Error",
              details: result.error.flatten(),
            },
          },
          422,
        );
      }
    },
  });
};

export function generateOpenAPISpec(app: OpenAPIHono<AppEnv>) {
  app.openAPIRegistry.registerComponent("securitySchemes", "cookieAuth", {
    type: "apiKey",
    in: "cookie",
    name: "better-auth.session_token",
    description:
      "Session cookie set by Better Auth on sign-in. Required for all protected routes.",
  });

  const spec = app.getOpenAPI31Document(
    {
      openapi: "3.1.0",
      info: {
        version: "1.0.0",
        title: "Catat API Documentations",
        description: "API for Catat Backend Built with Hono",
      },
      security: [{ cookieAuth: [] }],
    } as never,
    { unionPreferredType: "oneOf" } as never,
  ) as unknown as Record<string, unknown>;

  // Manually merge auth routes since hono-openapi's describeRoute
  // doesn't register with @hono/zod-openapi's registry
  const paths = (spec.paths as Record<string, unknown>) ?? {};
  paths["/api/auth/session"] = {
    get: {
      tags: ["Auth"],
      summary: "Get current session",
      description:
        "Returns the current user's session information if authenticated.",
      responses: {
        "200": {
          description: "Session information",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  user: { type: "object" },
                  session: { type: "object" },
                },
              },
            },
          },
        },
        "401": {
          description: "Not authenticated",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean" },
                  error: { type: "object" },
                },
              },
            },
          },
        },
      },
    },
  };
  paths["/api/auth/sign-out"] = {
    post: {
      tags: ["Auth"],
      summary: "Sign out",
      description: "Signs out the current user by clearing their session.",
      responses: {
        "200": {
          description: "Sign out successful",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                },
              },
            },
          },
        },
      },
    },
  };
  paths["/api/auth/sign-in/email"] = {
    post: {
      tags: ["Auth"],
      summary: "Sign in with email and password",
      description:
        "Authenticates a user using their email and password. Sets a session cookie on success.",
      requestBody: {
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["email", "password"],
              properties: {
                email: { type: "string", format: "email" },
                password: { type: "string" },
              },
            },
          },
        },
      },
      responses: {
        "200": {
          description: "Sign in successful",
          content: {
            "application/json": {
              schema: { type: "object" },
            },
          },
        },
        "401": {
          description: "Invalid credentials",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean" },
                  error: { type: "object" },
                },
              },
            },
          },
        },
      },
    },
  };
  paths["/api/auth/sign-up/email"] = {
    post: {
      tags: ["Auth"],
      summary: "Sign up with email and password",
      description:
        "Creates a new user account with email and password. Sends verification email if configured.",
      requestBody: {
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["email", "password", "name"],
              properties: {
                email: { type: "string", format: "email" },
                password: { type: "string", minLength: 8 },
                name: { type: "string" },
              },
            },
          },
        },
      },
      responses: {
        "200": {
          description: "Account created successfully",
          content: {
            "application/json": {
              schema: { type: "object" },
            },
          },
        },
        "422": {
          description: "Validation error or email already registered",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean" },
                  error: { type: "object" },
                },
              },
            },
          },
        },
      },
    },
  };
  paths["/api/auth/sign-in/{provider}"] = {
    post: {
      tags: ["Auth"],
      summary: "Sign in with social provider",
      description:
        "Initiates OAuth sign-in with the specified provider. Redirects to the provider's authorization page.",
      parameters: [
        {
          name: "provider",
          in: "path",
          required: true,
          schema: { type: "string" },
        },
      ],
      responses: {
        "302": {
          description: "Redirect to OAuth provider",
        },
      },
    },
    get: {
      tags: ["Auth"],
      summary: "Sign in with social provider (callback)",
      description: "OAuth callback handler for social provider sign-in.",
      parameters: [
        {
          name: "provider",
          in: "path",
          required: true,
          schema: { type: "string" },
        },
      ],
      responses: {
        "200": {
          description: "OAuth callback response",
        },
      },
    },
  };
  spec.paths = paths;

  return spec;
}
