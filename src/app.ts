import { createRouter } from "./factory";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import notFound from "stoker/middlewares/not-found";
import onError from "stoker/middlewares/on-error";
import { apiReference } from "@scalar/hono-api-reference";

const app = createRouter();

// Middlewares
app.use(logger());
app.use(cors());

// Internal modules
import authRouter from "./modules/auth";

app.route("/", authRouter);

// OpenAPI Specification
app.doc("/openapi", {
  openapi: "3.0.0",
  info: {
    version: "1.0.0",
    title: "Catat API Documentations",
    description: "API for Catat Backend Built with Hono",
  },
});

// Scalar API Reference UI
app.get(
  "/reference",
  apiReference({
    // @ts-expect-error - 'spec' is valid in newer/older versions but types might be outdated
    spec: { url: "/openapi" },
  }),
);

// Basic Route
app.get("/", (c) => c.text("Catat API is up and running!"));

// Apply Error Handlers
app.notFound(notFound);
app.onError(onError);

export default app;
