import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { apiReference } from "@scalar/hono-api-reference";
import notFound from "stoker/middlewares/not-found";
import onError from "stoker/middlewares/on-error";
import * as HttpStatus from "stoker/http-status-codes";

import { createRouter, generateOpenAPISpec } from "./factory";
import { env } from "./env";
import { auth, categories, transactions, profile } from "./modules";
import {
  getCachedSpec,
  setCachedSpec,
  invalidateCache,
} from "./lib/openapi-cache";

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
app.route("/", auth);
app.route("/api/categories", categories);
app.route("/api/transactions", transactions);
app.route("/api/me", profile);

// Basic Route
app.get("/", (c) => c.text("Catat API is up and running!"));

// OpenAPI Specification with in-memory caching
app.get("/api/openapi.json", (c) => {
  const cached = getCachedSpec();
  if (cached) {
    return c.json(cached);
  }

  const spec = generateOpenAPISpec(app);
  setCachedSpec(spec);
  return c.json(spec);
});

app.post("/api/openapi.json/invalidate", (c) => {
  if (env.NODE_ENV !== "development") {
    return c.json(
      { success: false, error: { message: "Dev only" } },
      HttpStatus.FORBIDDEN,
    );
  }
  invalidateCache();
  return c.json({ success: true });
});

// Scalar API Reference UI
app.get(
  "/reference",
  apiReference({
    spec: { url: "/api/openapi.json" },
  } as unknown as Parameters<typeof apiReference>[0]),
);

// Apply Error Handlers
app.notFound(notFound);
app.onError(onError);

export default app;
