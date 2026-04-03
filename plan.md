# Catat Backend: Financial Modules Implementation Plan

This document outlines the phased implementation plan for the core financial modules of the Catat app: Categories, Transactions, Summary/Analytics, and supporting features.

Given the extensive scope (26 user stories), development is broken down into **8 manageable phases** to ensure strict adherence to `AGENTS.md` guidelines, enforcing TDD, proper modular monolith architecture, and detailed OpenAPI documentation for the frontend SDK.

## Core Guiding Principles

1. **TDD First**: No production code without a failing test first. `bun:test` tests for services and handlers in `__tests__/` folders.
2. **Modular Monolith**: Code is split by feature vertical (`src/modules/*`).
3. **OpenAPI Standards**: All routes use `describeRoute`, `validator`, and `resolver` to generate the Swagger spec and Frontend SDK.
4. **Code Quality**: `bun test`, `bun lint` (oxlint), `bun format` (oxfmt), and `bun check` must pass at the end of each phase.
5. **No `any` types**: All code must be properly typed. Use proper TypeScript types instead of `any`.

---

## Current State Assessment (as of 2026-04-04)

### What Already Exists:

- ✅ Database schemas for `category` and `transaction` tables with relations
- ✅ Categories module with CRUD, Zod v4 validation, OpenAPI docs, and tests
- ✅ Transactions module with CRUD, basic filtering (categoryId, type, limit, offset), and tests
- ✅ Profile module with CRUD operations and tests
- ✅ Auth module with session management and Google OAuth
- ✅ Factory pattern, auth middleware, error handling, OpenAPI setup
- ✅ CI workflow (GitHub Actions)
- ✅ OpenAPI caching with invalidation endpoint

### Current Build Status:

- ✅ `bun test` — **60 pass, 0 fail** (10 test files)
- ✅ `bun check` — **0 TS errors**
- ✅ `bun lint` — **0 errors, 0 warnings**
- ✅ `bun format` — **no diff**
- ✅ `bun openapi:generate` — **generates without error**

### Resolved Issues:

- ✅ Categories service `any` type → proper `InsertCategory` type
- ✅ Transactions service `any` type → `Record<string, unknown>`
- ✅ Categories schema updated for Zod v4 API (removed deprecated callbacks)
- ✅ All routes use `resolver()` wrapper for OpenAPI response schemas
- ✅ All `:id` routes have `validator("param")` middleware
- ✅ All test files use proper type assertions (no `unknown` body errors)
- ✅ Test mocks use `unknown` instead of `any` for auth middleware
- ✅ Test IDs use valid UUIDs (param schema validation)
- ✅ `env.ts` provides test defaults when `NODE_ENV=test`
- ✅ `@hono/standard-validator` dependency installed

### Remaining Issues:

- ❌ **Soft delete not implemented** — `deleteTransaction` (transactions.service.ts:74-79) does hard delete via `db.delete()`, ignoring the `deletedAt` field
- ❌ **Categories missing validation** — No circular parent reference prevention, no duplicate name validation per user
- ❌ **No advanced transaction filtering** — Only `categoryId`, `type`, `limit`, `offset` supported; missing search, date range, sorting, pagination
- ❌ **No bulk operations** — No bulk delete, undo delete, or bulk update endpoints
- ❌ **No summary/analytics module** — `src/modules/summary/` does not exist
- ❌ **No upload module** — `src/modules/uploads/` does not exist
- ❌ **No export functionality** — No CSV/Excel export endpoints

### Module Inventory:

| Module | Files | Tests | Status |
|--------|-------|-------|--------|
| `auth/` | 4 files | 2 test files | ✅ Complete |
| `profile/` | 4 files | 2 test files | ✅ Complete |
| `categories/` | 5 files | 2 test files | ⚠️ Needs Phase 1 enhancements |
| `transactions/` | 5 files | 2 test files | ⚠️ Needs Phases 2-4, 7 |
| `summary/` | 0 files | 0 test files | ❌ Not started (Phase 5) |
| `uploads/` | 0 files | 0 test files | ❌ Not started (Phase 6) |

### Mounted Routes (from app.ts):

| Route | Module | Status |
|-------|--------|--------|
| `/` | auth | ✅ Mounted |
| `/api/categories` | categories | ✅ Mounted |
| `/api/transactions` | transactions | ✅ Mounted |
| `/api/me` | profile | ✅ Mounted |
| `/api/summary` | summary | ❌ Not mounted |
| `/api/uploads` | uploads | ❌ Not mounted

---

## Phase 0: Fix All Existing Issues (Pre-requisite) ✅ COMPLETED

**Goal**: Make the entire codebase pass `bun test`, `bun check`, `bun lint`, `bun format` before building new features.

### What Was Done:

- ✅ Installed `@hono/standard-validator` dependency
- ✅ Added test defaults to `env.ts` with `NODE_ENV=test` detection
- ✅ Fixed categories schema for Zod v4 API (removed deprecated callbacks)
- ✅ Added `resolver()` wrapper to all category route OpenAPI responses
- ✅ Added `validator("param")` middleware to category `:id` routes
- ✅ Fixed `createCategory` service: `any` → `InsertCategory`
- ✅ Fixed `updateTransaction` service: `any` → `Record<string, unknown>`
- ✅ Fixed all test imports and type assertions
- ✅ Replaced invalid test IDs with proper UUIDs
- ✅ Replaced `any` in auth mock callbacks with `unknown`

### Verification Results:

- ✅ `bun test` — 60 pass, 0 fail
- ✅ `bun check` — 0 errors
- ✅ `bun lint` — 0 errors, 0 warnings
- ✅ `bun format` — no diff
- ✅ `bun openapi:generate` — generates without error

---

## Phase 1: Enhance Categories Module

**Goal**: Add missing validations and error handling to the categories module.

### User Stories Covered:

- #13 Create custom categories (enhance)
- #14 Edit categories (enhance)
- #15 Delete categories (enhance)
- #16 Add color/icon to category (already exists)
- #17 Create sub-categories (enhance)

### Already Completed (Phase 0):

- ✅ `createCategory` uses proper `InsertCategory` type (no `any`)
- ✅ Zod v4 compatible schema validation
- ✅ Full OpenAPI documentation with `resolver()` and `validator()`
- ✅ Test suite with service and handler tests

### Components to Add: `src/modules/categories/`

#### 1. Add Validation (`categories.service.ts`)

- Add circular parent reference prevention (prevent category from being its own parent or ancestor)
- Add duplicate name validation per user
- Add proper error types (e.g., `CategoryNotFoundError`, `DuplicateCategoryError`)

#### 2. Enhance Tests (`__tests__/`)

- Add tests for circular reference prevention
- Add tests for duplicate name validation
- Add tests for proper error throwing

### Verification:

- [ ] All tests pass: `bun test src/modules/categories/__tests__/`
- [ ] No lint errors: `bun lint`
- [ ] No format issues: `bun format` (no diff)
- [ ] Type check passes: `bun check`
- [ ] OpenAPI spec generates correctly: `bun openapi:generate`

**Current status**: ❌ Not started — service has no circular reference prevention or duplicate name validation

---

## Phase 2: Fix Transactions Module — Soft Delete

**Goal**: Implement soft delete and improve validation in the transactions module.

### User Stories Covered:

- #3 Create transaction (already works)
- #4 Edit transaction (already works)
- #5 Delete transaction (fix - implement soft delete)
- #10 Add notes/description (already exists)
- #11 Add tags (already exists)
- #12 Upload receipt image (schema exists, implementation pending)

### Already Completed (Phase 0):

- ✅ `updateTransaction` uses `Record<string, unknown>` (no `any`)
- ✅ Test suite with service and handler tests
- ✅ Full OpenAPI documentation

### Components to Fix: `src/modules/transactions/`

#### 1. Implement Soft Delete (`transactions.service.ts`)

- Change `deleteTransaction` to set `deletedAt` instead of hard delete
- Filter out soft-deleted records in `getTransactions` and `getTransactionById`

#### 2. Enhance Schema (`transactions.schema.ts`)

- Add `deletedAt` to select schema

#### 3. Enhance Tests (`__tests__/`)

- Add tests for soft delete functionality
- Add tests for filtering out soft-deleted records

### Verification:

- [ ] All tests pass: `bun test src/modules/transactions/__tests__/`
- [ ] No lint errors: `bun lint`
- [ ] No format issues: `bun format` (no diff)
- [ ] Type check passes: `bun check`
- [ ] OpenAPI spec generates correctly: `bun openapi:generate`

**Current status**: ❌ Not started — `deleteTransaction` still does hard delete (line 74-79), `getTransactions` does not filter `deletedAt`

---

## Phase 3: Advanced Transaction Listing & Filtering

**Goal**: Implement advanced querying features for the transaction list view.

### User Stories Covered:

- #1 See all transactions (enhance)
- #2 Sort by price/date
- #6 Filter by category
- #7 Filter by income/expense
- #8 Search by keyword
- #9 Filter by date range

### Current State:

- ⚠️ Basic filtering exists (`categoryId`, `type`, `limit`, `offset`) in `getTransactions`
- ❌ No pagination (page/limit pattern)
- ❌ No sorting (hardcoded to `desc(transaction.date)`)
- ❌ No keyword search
- ❌ No date range filtering

### Current State:

- ⚠️ Basic filtering exists (`categoryId`, `type`, `limit`, `offset`) in `getTransactions`
- ❌ No pagination (page/limit pattern)
- ❌ No sorting (hardcoded to `desc(transaction.date)`)
- ❌ No keyword search
- ❌ No date range filtering

### Components to Add/Modify: `src/modules/transactions/`

#### 1. Enhanced Query Schema (`transactions.schema.ts`)

```typescript
export const transactionListQuerySchema = z.object({
  page: z.string().optional().transform(Number).default("1"),
  limit: z.string().optional().transform(Number).default("20"),
  sort: z.enum(["amount", "date", "createdAt"]).optional().default("date"),
  order: z.enum(["asc", "desc"]).optional().default("desc"),
  categoryId: z.string().uuid().optional(),
  type: z.enum(["income", "expense"]).optional(),
  search: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});
```

#### 2. Enhanced Service (`transactions.service.ts`)

- Implement dynamic query building with all filters
- Add sorting support
- Add pagination with page/limit
- Add keyword search (notes, tags)
- Add date range filtering

#### 3. Enhanced Routes (`transactions.routes.ts`)

- Add query parameter validation using `validator`
- Update OpenAPI documentation with all query parameters

#### 4. Tests (`__tests__/`)

- Test each filter independently
- Test combined filters
- Test sorting and pagination
- Test search functionality

### Verification:

- [ ] All tests pass
- [ ] No lint/format errors
- [ ] Type check passes
- [ ] OpenAPI spec updated

---

## Phase 4: Bulk Operations & Undo Delete

**Goal**: Implement bulk operations and undo functionality for transactions.

### User Stories Covered:

- #5 Bulk delete transactions
- #24 Bulk select transactions
- #26 Undo delete

### Components to Add: `src/modules/transactions/`

#### 1. New Schemas (`transactions.schema.ts`)

```typescript
export const bulkDeleteSchema = z.object({
  ids: z.array(z.string().uuid()).min(1),
});

export const undoDeleteSchema = z.object({
  ids: z.array(z.string().uuid()).min(1),
});

export const bulkUpdateSchema = z.object({
  ids: z.array(z.string().uuid()).min(1),
  categoryId: z.string().uuid().nullable().optional(),
  tags: z.array(z.string()).optional(),
});
```

#### 2. New Service Functions (`transactions.service.ts`)

- `bulkSoftDelete(ids: string[], userId: string)` - Sets `deletedAt` for multiple transactions
- `undoSoftDelete(ids: string[], userId: string)` - Clears `deletedAt` for multiple transactions
- `bulkUpdate(ids: string[], userId: string, data: Partial<Transaction>)` - Updates multiple transactions

#### 3. New Routes (`transactions.routes.ts`)

- `POST /api/transactions/bulk-delete`
- `POST /api/transactions/undo-delete`
- `PATCH /api/transactions/bulk`

#### 4. Tests (`__tests__/`)

- Test bulk delete with multiple IDs
- Test undo delete functionality
- Test bulk update with partial data
- Test authorization (users can only operate on their own transactions)

### Verification:

- [ ] All tests pass
- [ ] No lint/format errors
- [ ] Type check passes
- [ ] OpenAPI spec updated

---

## Phase 5: Summary & Analytics Module

**Goal**: Create new module for financial summaries and analytics.

### User Stories Covered:

- #18 See total income
- #19 See total expenses
- #20 See balance
- #21 See monthly summary
- #22 See spending by category
- #23 See daily/weekly/monthly spending

### Components to Create: `src/modules/summary/`

#### 1. Database Schema (if needed)

- May use existing transaction table with aggregations
- Consider materialized views for performance if needed

#### 2. Schema (`summary.schema.ts`)

```typescript
export const balanceResponseSchema = z.object({
  income: z.number(),
  expenses: z.number(),
  balance: z.number(),
});

export const monthlySummarySchema = z.object({
  month: z.number(),
  income: z.number(),
  expenses: z.number(),
  balance: z.number(),
});

export const categorySpendingSchema = z.object({
  categoryId: z.string().uuid(),
  categoryName: z.string(),
  total: z.number(),
  count: z.number(),
});

export const trendQuerySchema = z.object({
  period: z.enum(["daily", "weekly", "monthly"]),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});
```

#### 3. Service (`summary.service.ts`)

- `getBalance(userId: string)` - Returns income, expenses, balance
- `getMonthlySummary(userId: string, year?: number)` - Monthly breakdown
- `getSpendingByCategory(userId: string, month?: number, year?: number)` - Category breakdown
- `getSpendingTrend(userId: string, period: 'daily' | 'weekly' | 'monthly', startDate?: Date, endDate?: Date)` - Trend data

#### 4. Handlers (`summary.handlers.ts`)

- `getBalanceHandler`
- `getMonthlySummaryHandler`
- `getSpendingByCategoryHandler`
- `getSpendingTrendHandler`

#### 5. Routes (`summary.routes.ts`)

- `GET /api/summary/balance`
- `GET /api/summary/monthly?year=2026`
- `GET /api/summary/by-category?month=1&year=2026`
- `GET /api/summary/trend?period=daily`

#### 6. Tests (`__tests__/`)

- Test balance calculations
- Test monthly summaries
- Test category aggregations
- Test trend calculations

### Verification:

- [ ] All tests pass
- [ ] No lint/format errors
- [ ] Type check passes
- [ ] OpenAPI spec updated
- [ ] Mount in `app.ts`: `app.route("/api/summary", summary)`

---

## Phase 6: Receipt Upload Module

**Goal**: Implement file upload functionality for receipt images.

### User Stories Covered:

- #12 Upload receipt image for a transaction

### Prerequisites:

- Cloudflare R2 bucket configured (`catat-receipts`)
- Environment variables: `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_ENDPOINT`, `R2_BUCKET_NAME`

### Components to Create: `src/modules/uploads/`

#### 1. Schema (`uploads.schema.ts`)

```typescript
export const uploadResponseSchema = z.object({
  url: z.string().url(),
  key: z.string(),
});
```

#### 2. Service (`uploads.service.ts`)

- `uploadReceipt(file: File, userId: string)` - Uploads to R2 and returns URL
- `deleteReceipt(key: string, userId: string)` - Deletes from R2

#### 3. Handlers (`uploads.handlers.ts`)

- `uploadReceiptHandler` - Handles multipart form data
- `deleteReceiptHandler` - Deletes receipt

#### 4. Routes (`uploads.routes.ts`)

- `POST /api/uploads/receipt` - FormData with `file` field
- `DELETE /api/uploads/receipt/:key` - Deletes receipt

#### 5. Tests (`__tests__/`)

- Mock R2 client for testing
- Test file validation (size, type)
- Test upload success
- Test delete functionality

### Verification:

- [ ] All tests pass
- [ ] No lint/format errors
- [ ] Type check passes
- [ ] OpenAPI spec updated
- [ ] Mount in `app.ts`: `app.route("/api/uploads", uploads)`

---

## Phase 7: Transaction Export

**Goal**: Implement CSV/Excel export functionality for transactions.

### User Stories Covered:

- #25 Export transactions (CSV/Excel)

### Components to Add: `src/modules/transactions/`

#### 1. Schema Enhancement (`transactions.schema.ts`)

```typescript
export const exportQuerySchema = z.object({
  format: z.enum(["csv", "excel"]).default("csv"),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  categoryId: z.string().uuid().optional(),
  type: z.enum(["income", "expense"]).optional(),
});
```

#### 2. Service Enhancement (`transactions.service.ts`)

- `exportTransactions(userId: string, filters: ExportFilters, format: 'csv' | 'excel')` - Generates export file

#### 3. Route Enhancement (`transactions.routes.ts`)

- `GET /api/transactions/export?format=csv` - Returns CSV file
- `GET /api/transactions/export?format=excel` - Returns Excel file

#### 4. Tests (`__tests__/`)

- Test CSV generation
- Test Excel generation
- Test filtering during export
- Test empty result handling

### Verification:

- [ ] All tests pass
- [ ] No lint/format errors
- [ ] Type check passes
- [ ] OpenAPI spec updated

---

## Phase 8: Integration & Polish

**Goal**: Ensure all modules work together seamlessly and fix any remaining issues.

### Tasks:

1. **Cross-module integration testing**
   - Test transaction creation with category assignment
   - Test summary calculations after transaction CRUD operations
   - Test receipt URL assignment to transactions

2. **OpenAPI spec validation**
   - Generate final OpenAPI spec
   - Validate all endpoints are documented
   - Check Scalar API reference UI

3. **Performance optimization**
   - Add database indexes if needed
   - Optimize summary queries
   - Add caching if necessary

4. **Final verification**
   - Run full test suite: `bun test`
   - Run linting: `bun lint`
   - Run formatting: `bun format`
   - Run type check: `bun check`
   - Generate OpenAPI: `bun openapi:generate`

### Verification:

- [ ] All tests pass: `bun test`
- [ ] No lint errors: `bun lint`
- [ ] No format issues: `bun format` (no diff)
- [ ] Type check passes: `bun check`
- [ ] OpenAPI spec generates correctly: `bun openapi:generate`
- [ ] All 26 user stories are covered

---

## Module Structure Overview

```
src/
├── modules/
│   ├── auth/                    # ✅ Existing - Authentication (4 files, 2 test files)
│   ├── profile/                 # ✅ Existing - User profile (4 files, 2 test files)
│   ├── categories/              # ⚠️ Phase 1 - CRUD complete, needs validation (5 files, 2 test files)
│   ├── transactions/            # ⚠️ Phases 2-4, 7 - CRUD works, needs soft delete + features (5 files, 2 test files)
│   ├── summary/                 # ❌ Phase 5 - Does NOT exist yet (0 files)
│   └── uploads/                 # ❌ Phase 6 - Does NOT exist yet (0 files)
├── db/
│   └── schema/
│       ├── auth-schema.ts       # ✅ Existing
│       ├── categories-schema.ts # ✅ Existing
│       ├── transactions-schema.ts # ✅ Existing
│       └── index.ts             # ✅ Existing
├── middlewares/
│   └── __tests__/auth.middleware.test.ts  # ✅ Auth middleware tests
├── lib/
│   └── __tests__/errors.test.ts           # ✅ Error class tests
└── app.ts                       # ✅ 4 modules mounted, summary/uploads NOT mounted
```

## Test Coverage Summary

| Area | Test Files | Coverage |
|------|-----------|----------|
| Auth module | 2 | ✅ Service + router tests |
| Profile module | 2 | ✅ Service + handler tests |
| Categories module | 2 | ✅ Service + handler tests |
| Transactions module | 2 | ✅ Service + handler tests |
| Auth middleware | 1 | ✅ requireAuth + requireRole |
| Error classes | 1 | ✅ Domain error types |
| Summary module | 0 | ❌ Module doesn't exist |
| Uploads module | 0 | ❌ Module doesn't exist |
| **Total** | **10 test files** | **60 pass, 0 fail** |

## User Story Coverage Matrix

| User Story                  | Phase | Status          | Notes |
| --------------------------- | ----- | --------------- | ----- |
| #1 See all transactions     | 3     | ⚠️ Partial      | Basic listing works, no pagination/sort |
| #2 Sort price               | 3     | ❌ To implement | Hardcoded sort only |
| #3 Create transaction       | 2     | ✅ Working      | |
| #4 Edit transaction         | 2     | ✅ Working      | |
| #5 Delete transaction       | 2, 4  | ❌ Hard delete  | Soft delete NOT implemented |
| #6 Filter by category       | 3     | ⚠️ Partial      | Basic filter exists |
| #7 Filter by income/expense | 3     | ⚠️ Partial      | Basic filter exists |
| #8 Search by keyword        | 3     | ❌ To implement | |
| #9 Filter by date range     | 3     | ❌ To implement | |
| #10 Add notes               | 2     | ✅ Working      | |
| #11 Add tags                | 2     | ✅ Working      | |
| #12 Upload receipt          | 6     | ❌ To implement | Uploads module doesn't exist |
| #13 Create categories       | 1     | ✅ Working      | |
| #14 Edit categories         | 1     | ✅ Working      | |
| #15 Delete categories       | 1     | ✅ Working      | |
| #16 Add color/icon          | 1     | ✅ Working      | |
| #17 Sub-categories          | 1     | ❌ Validation   | No circular ref prevention |
| #18 Total income            | 5     | ❌ To implement | Summary module doesn't exist |
| #19 Total expenses          | 5     | ❌ To implement | Summary module doesn't exist |
| #20 Balance                 | 5     | ❌ To implement | Summary module doesn't exist |
| #21 Monthly summary         | 5     | ❌ To implement | Summary module doesn't exist |
| #22 Spending by category    | 5     | ❌ To implement | Summary module doesn't exist |
| #23 Daily/weekly/monthly    | 5     | ❌ To implement | Summary module doesn't exist |
| #24 Bulk select             | 4     | ❌ To implement | |
| #25 Export CSV/Excel        | 7     | ❌ To implement | |
| #26 Undo delete             | 4     | ❌ To implement | Depends on soft delete |

### Progress Summary

| Metric | Count |
|--------|-------|
| ✅ Fully working | 9 user stories (#3, #4, #6 basic, #7 basic, #10, #11, #13-16) |
| ⚠️ Partially working | 3 user stories (#1, #6, #7) |
| ❌ Not implemented | 14 user stories (#2, #5 soft delete, #8, #9, #12, #17-26) |
| **Total** | **26 user stories** |

## Execution Order Recommendation

1. **Start with Phase 1** - Fix categories module (quick wins, foundation for transactions)
2. **Phase 2** - Fix transactions module (foundation for advanced features)
3. **Phase 3** - Advanced filtering (most requested feature)
4. **Phase 4** - Bulk operations (depends on Phase 2 soft delete)
5. **Phase 5** - Summary module (independent, can be parallelized after Phase 2)
6. **Phase 6** - Upload module (independent, can be parallelized after Phase 2)
7. **Phase 7** - Export feature (depends on Phase 3 filtering)
8. **Phase 8** - Integration & polish (final verification)

**Note**: Phases 5 and 6 can be worked on in parallel after Phase 2 is complete, as they don't depend on each other.
