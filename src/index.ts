import app from "./app";
import { env } from "./env";

console.log(`🚀 Server starting on http://localhost:${env.PORT}`);
console.log(
  `📖 API Reference available at http://localhost:${env.PORT}/reference`,
);

export default {
  port: env.PORT,
  fetch: app.fetch,
};
