/**
 * Generate OpenAPI spec ke file openapi.json
 *
 * Usage: bun run openapi:generate
 * Output: ./openapi.json (di root project)
 */
import * as fs from "node:fs";

// Mock env vars before importing app so env validation passes
process.env.NODE_ENV = "test";
process.env.DATABASE_URL = "postgresql://mock:mock@localhost:5432/mock";
process.env.BETTER_AUTH_SECRET = "mock_secret_for_openapi_generation";
process.env.GOOGLE_CLIENT_ID = "mock_id";
process.env.GOOGLE_CLIENT_SECRET = "mock_secret";
process.env.ALLOWED_EMAILS = "mock@example.com";
process.env.FRONTEND_URL = "http://localhost:5173";

async function generate() {
  console.log("Generating OpenAPI schema...");

  try {
    // Dynamically import app so env validation happens AFTER we set the mocks
    const { default: app } = await import("../app");

    // app.request simulates an HTTP request without starting a real server
    const res = await app.request("/api/openapi.json");

    if (!res.ok) {
      throw new Error(`Failed to fetch /api/openapi.json: ${res.statusText}`);
    }

    const spec = await res.json();
    const output = "./openapi.json";
    fs.writeFileSync(output, JSON.stringify(spec, null, 2));
    console.log(`✅ OpenAPI schema generated: ${output}`);
  } catch (e: unknown) {
    if (e instanceof Error) {
      console.error("Error:", e.stack || e.message);
    } else {
      console.error("Error:", e);
    }
    process.exit(1);
  }
}

generate();
