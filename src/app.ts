import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { describeRoute, openAPISpecs } from "hono-openapi";
import { apiReference } from "@scalar/hono-api-reference";
import notFound from "stoker/middlewares/not-found";
import onError from "stoker/middlewares/on-error";

import { createRouter } from "./factory";
import { env } from "./env";
import authRouter from "./modules/auth";
import transactionsRouter from "./modules/transactions";

const app = createRouter();

// Middlewares
app.use(logger());
app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
  }),
);

// Internal modules
app.route("/", authRouter);
app.route("/api/transactions", transactionsRouter);

// Basic Route
app.get(
  "/",
  describeRoute({
    summary: "Health Check",
    description:
      "Returns a simple message to verify the API is up and running.",
    responses: {
      200: {
        description: "Successful response",
        content: {
          "text/plain": {
            schema: { type: "string", example: "Catat API is up and running!" },
          },
        },
      },
    },
  }),
  (c) => c.text("Catat API is up and running!"),
);

// OpenAPI Specification using hono-openapi's middleware
app.get(
  "/openapi",
  openAPISpecs(app, {
    documentation: {
      info: {
        version: "1.0.0",
        title: "Catat API Documentations",
        description: "API for Catat Backend Built with Hono",
      },
    },
  }),
);

// Scalar API Reference UI
app.get(
  "/reference",
  apiReference({
    spec: { url: "/openapi" },
  } as unknown as Parameters<typeof apiReference>[0]),
);

// Apply Error Handlers
app.notFound(notFound);
app.onError(onError);

export default app;
