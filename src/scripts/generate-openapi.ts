import { writeFileSync } from "node:fs";
import app from "../app";

/**
 * Script to generate OpenAPI specification file (openapi.json).
 * This allows static analyzers and frontend generators to use the current API spec.
 */
async function generate() {
  console.log("Generating OpenAPI specification...");

  // Trigger internal request to Hono app's /.openapi endpoint
  const res = await app.request("/openapi");

  if (res.status !== 200) {
    console.error(`Failed to generate OpenAPI: Received status ${res.status}`);
    const text = await res.text();
    console.error(text);
    process.exit(1);
  }

  const spec = await res.json();
  const filePath = "./openapi.json";

  writeFileSync(filePath, JSON.stringify(spec, null, 2), "utf-8");

  console.log(`✅ OpenAPI specification successfully saved to ${filePath}`);
}

generate().catch((err) => {
  console.error("❌ Unexpected error during OpenAPI generation:");
  console.error(err);
  process.exit(1);
});
