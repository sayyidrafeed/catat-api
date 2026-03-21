# AGENTS.md — Catat Backend Project Guidelines

This document is the **single source of truth** for AI agents working on the Catat backend project.
Read this file first. Follow it exactly. Load referenced skills for detailed patterns.

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Architecture: Modular Monolith](#architecture-modular-monolith)
3. [Module File Convention](#module-file-convention)
4. [Naming Conventions](#naming-conventions)
5. [TDD Workflow (CRITICAL)](#tdd-workflow-critical)
6. [Code Quality: oxlint & oxfmt](#code-quality-oxlint--oxfmt)
7. [Good vs Bad Patterns](#good-vs-bad-patterns)
8. [OpenAPI Documentation (REQUIRED)](#openapi-documentation-required)
9. [Golden Rules](#golden-rules)
10. [Skills Reference](#skills-reference)
11. [After User Prompt: Workflow](#after-user-prompt-workflow)
12. [Verification Checklist](#verification-checklist)

---

## Tech Stack

| Category              | Technology            | Purpose                                         |
| --------------------- | --------------------- | ----------------------------------------------- |
| **Runtime**           | Bun                   | Package manager, dev server, test runner        |
| **Framework**         | Hono v4+              | Web framework                                   |
| **ORM**               | Drizzle ORM           | Database access (PostgreSQL)                    |
| **Validation**        | Zod v4                | Runtime validation                              |
| **Schema Derivation** | drizzle-zod           | Drizzle → Zod schema generation                 |
| **Auth**              | Better Auth           | Authentication, sessions, OAuth                 |
| **API Docs**          | hono-openapi + Scalar | OpenAPI spec + interactive docs                 |
| **HTTP Utils**        | Stoker                | Status codes, error handlers, middleware        |
| **Linting**           | oxlint                | Code linting (unicorn, typescript, oxc plugins) |
| **Formatting**        | oxfmt                 | Code formatting                                 |

---

## Architecture: Modular Monolith

```
src/
├── index.ts              # Bun.serve entry point + API reference endpoint
├── app.ts                # CORS, logger, error handlers, route mounting
├── factory.ts            # createRouter() + AppEnv — SINGLE SOURCE OF TRUTH
├── env.ts                # t3-env validation for environment variables
├── auth.ts               # Better Auth configuration (social providers, sessions)
├── db/
│   ├── index.ts          # Drizzle client singleton
│   └── schema/           # Database schemas (domain-split)
│       ├── auth-schema.ts
│       ├── index.ts
│       └── ...
└── modules/              # Feature verticals (modular monolith)
    └── [module-name]/
        ├── [name].schema.ts      # Zod schemas (input/output/params)
        ├── [name].service.ts      # Business logic (pure functions)
        ├── [name].handlers.ts     # HTTP glue (thin, maps domain → HTTP)
        ├── [name].routes.ts       # Route definitions + OpenAPI docs
        ├── [name].index.ts        # Router export
        └── __tests__/             # TDD tests (MANDATORY)
            ├── [name].service.test.ts
            ├── [name].handlers.test.ts
            └── ...
```

### Key Architectural Principles

1. **Factory Rule**: Always use `createRouter()` from `@/factory`, NEVER `new Hono()`
2. **Service Purity**: Services take primitives, NEVER `Context` objects
3. **Import Direction**: `modules/` → `lib/`, `db/`, `middlewares/`. NEVER `modules/A → modules/B`
4. **Domain Isolation**: Each module is self-contained with its own schema, service, handlers, routes

---

## Module File Convention

### What Each File Does

| File            | Purpose                | Contents                                                           |
| --------------- | ---------------------- | ------------------------------------------------------------------ |
| `x.schema.ts`   | Zod validation schemas | Input validation, output serialization, query/param schemas        |
| `x.service.ts`  | Business logic         | Pure functions, domain errors, DB queries, transactions            |
| `x.handlers.ts` | HTTP glue              | Thin layer, extracts `c.req.valid()`, maps domain errors → HTTP    |
| `x.routes.ts`   | Route definitions      | `describeRoute()` + `validator()` + `resolver()`, middleware chain |
| `x.index.ts`    | Router export          | Combines routes, exports for mounting in `app.ts`                  |
| `__tests__/`    | Test suite             | Tests for service (pure) and handlers (integration)                |

### Example Module Structure

```
src/modules/todos/
├── todos.schema.ts       # Zod schemas for todo CRUD
├── todos.service.ts      # Business logic: createTodo, getTodos, updateTodo, deleteTodo
├── todos.handlers.ts     # HTTP handlers calling service methods
├── todos.routes.ts       # Route definitions with OpenAPI docs
├── todos.index.ts        # Export router
└── __tests__/
    ├── todos.service.test.ts    # Pure function tests
    └── todos.handlers.test.ts   # Handler/integration tests
```

### Route File Convention

Use sub-routers for related endpoints:

```
todos.routes.ts:
├── listRouter    → GET  /api/todos
├── detailRouter  → GET  /api/todos/:id
├── createRouter  → POST /api/todos
├── updateRouter  → PATCH /api/todos/:id
├── deleteRouter  → DELETE /api/todos/:id
└── todos.index.ts combines all sub-routers
```

---

## Naming Conventions

### Files

| Pattern  | Example             | Notes                                 |
| -------- | ------------------- | ------------------------------------- |
| Schema   | `todos.schema.ts`   | Singular, matches module name         |
| Service  | `todos.service.ts`  | Singular, matches module name         |
| Handlers | `todos.handlers.ts` | Plural or singular depending on scope |
| Routes   | `todos.routes.ts`   | Plural                                |
| Router   | `[name].index.ts`   | Always `.index.ts`                    |
| Tests    | `*.test.ts`         | Bun test runner convention            |

### Database Schemas (Drizzle)

| Pattern                  | Example                          |
| ------------------------ | -------------------------------- |
| Table name (snake_case)  | `user`, `todo_item`              |
| Column name (snake_case) | `created_at`, `email_verified`   |
| Relation function        | `userRelations`, `todoRelations` |

### Zod Schemas

| Pattern         | Suffix     | Example              |
| --------------- | ---------- | -------------------- |
| Insert schema   | `insert`   | `todoInsertSchema`   |
| Select schema   | `select`   | `todoSelectSchema`   |
| Params schema   | `param`    | `todoParamSchema`    |
| Query schema    | `query`    | `todoQuerySchema`    |
| Response schema | `response` | `todoResponseSchema` |

### TypeScript

| Pattern    | Convention             | Example                            |
| ---------- | ---------------------- | ---------------------------------- |
| Interfaces | PascalCase, no prefix  | `interface Todo`, `interface User` |
| Types      | PascalCase             | `type TodoList = Todo[]`           |
| Variables  | camelCase              | `const newTodo = ...`              |
| Constants  | SCREAMING_SNAKE_CASE   | `MAX_RETRIES = 3`                  |
| Functions  | camelCase, verb prefix | `getTodos()`, `createTodo()`       |

### API Routes

| HTTP Method | Purpose             | Example                 |
| ----------- | ------------------- | ----------------------- |
| `GET`       | Retrieve data       | `GET /api/todos`        |
| `POST`      | Create new resource | `POST /api/todos`       |
| `PATCH`     | Partial update      | `PATCH /api/todos/:id`  |
| `PUT`       | Full replace        | `PUT /api/todos/:id`    |
| `DELETE`    | Remove resource     | `DELETE /api/todos/:id` |

---

## TDD Workflow (CRITICAL)

**THIS IS NOT OPTIONAL.** Every module MUST have a `__tests__/` folder with tests.

### The Iron Law

```
NO PRODUCTION CODE WITHOUT A FAILING TEST FIRST
```

### Red-Green-Refactor Cycle

```
1. RED    → Write failing test. Watch it fail.
2. GREEN  → Write minimal code to pass.
3. REFACTOR → Clean up while keeping tests green.
```

### Test File Location

```
src/modules/[name]/
├── ...
└── __tests__/
    ├── [name].service.test.ts    # Pure function tests
    ├── [name].handlers.test.ts   # Handler/integration tests
    └── ...
```

### Bun Test Runner Commands

```bash
# Run all tests
bun test

# Run specific test file
bun test src/modules/todos/__tests__/todos.service.test.ts

# Run with coverage (if configured)
bun test --coverage
```

### Test Patterns

**GOOD: Test pure service functions**

```typescript
import { describe, test, expect } from "bun:test";
import { createTodo, getTodos } from "../todos.service";

describe("todos.service", () => {
  test("creates todo with valid input", async () => {
    const result = await createTodo({ title: "Test", userId: "user-1" });
    expect(result.title).toBe("Test");
  });
});
```

**GOOD: Test handlers with app.request()**

```typescript
import { describe, test, expect, beforeAll } from "bun:test";
import { app } from "@/app";

describe("todos.handlers", () => {
  test("GET /api/todos returns 200", async () => {
    const res = await app.request("/api/todos");
    expect(res.status).toBe(200);
  });
});
```

### What to Test

| Layer   | What to Test        | Example                                 |
| ------- | ------------------- | --------------------------------------- |
| Service | Pure business logic | `createTodo()` returns correct shape    |
| Service | Error cases         | `createTodo()` throws on invalid input  |
| Handler | HTTP response       | Status code, headers, body              |
| Handler | Validation          | Returns 422 on bad input                |
| Handler | Error mapping       | Maps domain error → correct HTTP status |

### Red Flags — STOP and Start Over

- Code before test
- Test after implementation
- Test passes immediately
- Missing `__tests__/` folder in module
- "I'll add tests later"

---

## Code Quality: oxlint & oxfmt

### Commands

```bash
# Lint and format
bun fl

# Lint only
bun lint

# Format only
bun format

# Type check
bun check

# Full check pipeline
bun fl && bun check
```

### oxlint Rules (Critical)

**Errors (must fix):**

```json
{
  "no-unused-vars": "error",
  "no-explicit-any": "error"
}
```

**Warnings (should fix):**

```json
{
  "max-lines": ["warn", { "max": 200 }],
  "no-empty-pattern": "warn",
  "no-useless-catch": "warn"
}
```

### oxfmt Config

```json
{
  "printWidth": 80,
  "ignorePatterns": [".agents/**", "src/components/ui/**", "src/**.gen.ts"]
}
```

### Pre-commit Hook (Recommended)

Run `bun fl` before every commit to catch issues early.

---

## Good vs Bad Patterns

### Factory Pattern

| Bad                             | Good                                       |
| ------------------------------- | ------------------------------------------ |
| `new Hono()`                    | `createRouter()`                           |
| `const app = new OpenAPIHono()` | `import { createRouter } from "@/factory"` |

### Date Handling

| Bad                           | Good                                       |
| ----------------------------- | ------------------------------------------ |
| `z.date()`                    | `z.iso.datetime()`                         |
| `new Date()` without timezone | Use `timestamp("created_at").defaultNow()` |

### Status Codes

| Bad                       | Good                                                                                 |
| ------------------------- | ------------------------------------------------------------------------------------ |
| `return c.json(..., 404)` | `import * as HttpStatus from "stoker/http-status-codes"` then `HttpStatus.NOT_FOUND` |
| Magic numbers             | Named constants                                                                      |

### Error Handling

| Bad                | Good                                          |
| ------------------ | --------------------------------------------- |
| Empty catch blocks | `catch (e) { throw e; }` or handle explicitly |
| `as any`           | Proper typing                                 |
| `@ts-ignore`       | Fix the type issue                            |

### Schema Derivation

| Bad                       | Good                                            |
| ------------------------- | ----------------------------------------------- |
| Hand-writing DB types     | `createInsertSchema()` / `createSelectSchema()` |
| `z.object()` for DB types | Use `drizzle-zod`                               |

### Service Layer

| Bad                                      | Good                                     |
| ---------------------------------------- | ---------------------------------------- |
| `Context` in services                    | Primitives only                          |
| Side effects in services                 | Pure functions                           |
| Services calling other services directly | Use module boundaries or shared services |

### Route Definitions

| Bad                     | Good                   |
| ----------------------- | ---------------------- |
| Missing `describeRoute` | Every route documented |
| No `validator`          | Validate all inputs    |
| No `resolver`           | Return typed responses |

### OpenAPI Documentation (REQUIRED)

**Every route MUST document all responses.** The spec generator uses this data.

```typescript
// GOOD: Complete OpenAPI documentation
listRouter.get(
  "/",
  describeRoute(
    "List all todos", // Summary
    "Returns a paginated list of todos for the user", // Description (optional)
  ),
  validator("query", todoQuerySchema),
  resolver({
    responses: {
      200: {
        description: "Successful response",
        content: {
          "application/json": {
            schema: todoListResponseSchema,
          },
        },
      },
      401: {
        description: "Unauthorized",
        content: {
          "application/json": {
            schema: errorResponseSchema,
          },
        },
      },
    },
  }),
  handler(listTodosHandler),
);

// BAD: Missing response documentation
listRouter.get(
  "/",
  describeRoute("List todos"), // No responses documented!
  validator("query", todoQuerySchema),
  handler(listTodosHandler),
);
```

**Required fields for every route:**

| Field                  | Required    | Example                                              |
| ---------------------- | ----------- | ---------------------------------------------------- |
| `summary`              | ✅ Yes      | `"Create a new todo"`                                |
| `description`          | Recommended | `"Creates a todo item for the authenticated user"`   |
| `responses`            | ✅ Yes      | `{ 200: {...}, 400: {...}, 401: {...}, 404: {...} }` |
| `response.description` | ✅ Yes      | `"Successful creation"`                              |
| `response.content`     | ✅ Yes      | JSON schema for response body                        |

**Response status codes to consider:**

- `200` — Success
- `201` — Created (POST success)
- `204` — No content (DELETE success)
- `400` — Bad request / validation error
- `401` — Unauthorized
- `403` — Forbidden
- `404` — Not found
- `422` — Unprocessable entity (handled automatically by validator)
- `500` — Internal server error

---

## Golden Rules

| Rule                   | Enforcement                                                                |
| ---------------------- | -------------------------------------------------------------------------- |
| **Factory Rule**       | `createRouter()` from `@/factory`, NEVER `new Hono()`                      |
| **Service Purity**     | Services take primitives, NEVER `Context`                                  |
| **Schema Derivation**  | `drizzle-zod` → `.omit()` → `.extend()`, NEVER hand-write DB types         |
| **ISO Dates**          | `z.iso.datetime()`, NEVER `z.date()`                                       |
| **OpenAPI Always**     | Every route: `describeRoute` + `resolver` + `validator`                    |
| **Import Direction**   | `modules/` → `lib/`, `db/`, `middlewares/`. NEVER `modules/A -> modules/B` |
| **Named Status Codes** | `stoker/http-status-codes`, NEVER magic numbers                            |
| **Domain Errors**      | Services throw domain errors, handlers map to `AppError` subclasses        |
| **TDD First**          | Write failing test BEFORE any production code                              |
| **Tests Required**     | Every module MUST have `__tests__/` folder                                 |

---

## Skills Reference

Load these skills when working on specific areas:

| Skill                          | When to Load                                 | What It Covers                                   |
| ------------------------------ | -------------------------------------------- | ------------------------------------------------ |
| **hono-best-practices**        | Route definitions, middleware, Hono patterns | Factory, OpenAPI, Stoker, route patterns         |
| **drizzle-best-practices**     | Database work, schemas, queries              | pgTable, relations, migrations, query patterns   |
| **better-auth-best-practices** | Auth setup, OAuth, sessions                  | Better Auth config, plugins, middleware          |
| **test-driven-development**    | Writing tests, TDD workflow                  | Red-green-refactor, test patterns, anti-patterns |

### How to Load Skills

When delegating tasks, include relevant skills:

```typescript
task(
  (category = "deep"),
  (load_skills = [
    "hono-best-practices",
    "drizzle-best-practices",
    "test-driven-development",
  ]),
  (prompt = "Create the todos module with TDD workflow..."),
);
```

---

## After User Prompt: Workflow

### Step 0: Intent Classification

Identify what the user wants:

| Intent         | User Says                          | Your Action                   |
| -------------- | ---------------------------------- | ----------------------------- |
| Research       | "explain X", "how does Y work"     | Explore → synthesize → answer |
| Implementation | "implement X", "add Y", "create Z" | Plan → TDD → delegate         |
| Investigation  | "look into X", "check Y"           | Explore → report findings     |
| Evaluation     | "what do you think about X?"       | Evaluate → propose → wait     |
| Fix            | "I'm seeing error X"               | Diagnose → minimal fix        |

### Step 1: Load Relevant Skills

Based on the task type, load appropriate skills:

```typescript
// Database work
load_skills: ["drizzle-best-practices"];

// Route/handler work
load_skills: ["hono-best-practices"];

// Auth work
load_skills: ["better-auth-best-practices"];

// Any feature/bugfix
load_skills: ["test-driven-development"];
```

### Step 2: For Implementation Tasks — TDD First

1. **Write failing tests FIRST** in `__tests__/` folder
2. Watch tests fail (verify RED)
3. Implement minimal code to pass
4. Watch tests pass (verify GREEN)
5. Refactor if needed (verify stays GREEN)

### Step 3: Follow Modular Monolith Structure

```
src/modules/[new-module]/
├── [name].schema.ts      # Zod schemas
├── [name].service.ts     # Business logic
├── [name].handlers.ts    # HTTP handlers
├── [name].routes.ts      # Route definitions
├── [name].index.ts       # Router export
└── __tests__/            # Tests (MANDATORY)
```

### Step 4: Apply Golden Rules

- [ ] Using `createRouter()` not `new Hono()`
- [ ] Services are pure (no Context)
- [ ] Using `drizzle-zod` for schema derivation
- [ ] ISO dates with `z.iso.datetime()`
- [ ] Every route has `describeRoute` + `validator` + `resolver`
- [ ] Named status codes from Stoker
- [ ] Domain errors thrown, handlers map to HTTP

### Step 5: Verify

```bash
# Run tests
bun test

# Lint and format
bun fl

# Type check
bun check

# Generate/update OpenAPI spec
bun openapi:generate
```

---

## Verification Checklist

Before marking work complete:

- [ ] All new modules have `__tests__/` folder
- [ ] Tests were written BEFORE implementation (TDD)
- [ ] All tests pass: `bun test`
- [ ] No lint errors: `bun lint`
- [ ] No format issues: `bun format` (no diff)
- [ ] Type check passes: `bun check`
- [ ] OpenAPI spec generated: `bun openapi:generate`
- [ ] Follows modular monolith structure
- [ ] Uses `createRouter()` not `new Hono()`
- [ ] Services are pure functions
- [ ] Routes have OpenAPI documentation (summary, description, all responses documented)
- [ ] Named status codes used (no magic numbers)

---

## Additional Resources

- [Hono Documentation](https://hono.dev/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [Better Auth](https://www.better-auth.com/)
- [Stoker](https://github.com/w3cj/stoker)
- [Zod](https://zod.dev/)
- [Bun](https://bun.sh/)
