/**
 * In-memory cache for the OpenAPI spec.
 * Prevents regeneration on every request.
 */

let cachedSpec: Record<string, unknown> | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 60_000; // 1 minute

export function getCachedSpec(): Record<string, unknown> | null {
  if (cachedSpec && Date.now() - cacheTimestamp < CACHE_TTL) {
    return cachedSpec;
  }
  return null;
}

export function setCachedSpec(spec: Record<string, unknown>): void {
  cachedSpec = spec;
  cacheTimestamp = Date.now();
}

export function invalidateCache(): void {
  cachedSpec = null;
  cacheTimestamp = 0;
}
