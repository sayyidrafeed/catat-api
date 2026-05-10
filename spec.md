# Catat API Spec — `/api/dashboard/summary`

> **Status**: Draft — menunggu peer review  
> **Author**: Sisyphus  
> **Last Updated**: 2026-05-10

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Endpoint](#endpoint)
4. [Query Parameters](#query-parameters)
5. [Response Schema](#response-schema)
   - [Period Object](#period-object)
   - [Overview Object](#overview-object)
   - [Comparison Object](#comparison-object)
   - [Category Breakdown Object](#category-breakdown-object)
   - [Top Spending Categories](#top-spending-categories)
   - [Recent Transactions](#recent-transactions)
6. [Error Responses](#error-responses)
7. [Period Logic](#period-logic)
8. [Design Rationale](#design-rationale)
9. [Future Considerations](#future-considerations)

---

## Overview

Single endpoint yang mengembalikan semua data yang dibutuhkan untuk **dashboard home page**. Satu request, cukup untuk render:

- **Summary Cards** — total income, total expense, net balance, transaction count
- **Comparison Indicator** — vs periode sebelumnya (income/expense/net)
- **Donut/Pie Chart** — breakdown per kategori
- **Activity Feed** — transaksi terbaru

---

## Authentication

- **Required**: ✅ Cookie-based session (Better Auth)
- Route menggunakan `requireAuth()` middleware
- User ID diambil dari `c.get("user").id`

---

## Endpoint

```
GET /api/dashboard/summary
```

---

## Query Parameters

| Parameter   | Type     | Required | Default   | Description                                                                                       |
|-------------|----------|----------|-----------|---------------------------------------------------------------------------------------------------|
| `period`    | `string` | No       | `"month"` | Time range. Nilai valid: `"week"`, `"month"`, `"year"`, `"all"`                                 |
| `month`     | `string` | No       | —         | Specific month dalam format `YYYY-MM`. **Hanya berlaku** ketika `period=month`. Default: bulan berjalan |
| `year`      | `string` | No       | —         | Specific year dalam format `YYYY`. **Hanya berlaku** ketika `period=year`. Default: tahun berjalan |

### Validation Rules

```typescript
export const dashboardQuerySchema = z.object({
  period: z.enum(["week", "month", "year", "all"]).default("month"),
  month: z.string().regex(/^\d{4}-\d{2}$/).optional(),   // "2026-05"
  year: z.string().regex(/^\d{4}$/).optional(),           // "2026"
});
```

---

## Response Schema — `200 OK`

```json
{
  "success": true,
  "data": {
    "period": { ... },
    "overview": { ... },
    "comparison": { ... },
    "byCategory": [ ... ],
    "topSpendingCategories": [ ... ],
    "recentTransactions": [ ... ]
  }
}
```

### Top-Level Structure

| Field    | Type   | Description                          |
|----------|--------|--------------------------------------|
| `success`| `true` | Selalu `true` untuk response sukses |
| `data`   | `object` | Objek data dashboard (lihat di bawah) |

---

### `period` Object

Menggambarkan rentang waktu yang sedang dilihat.

| Field     | Type     | Description                                                                     |
|-----------|----------|---------------------------------------------------------------------------------|
| `start`   | `string` | ISO 8601 datetime — awal periode (e.g. `"2026-05-01T00:00:00.000Z"`)          |
| `end`     | `string` | ISO 8601 datetime — akhir periode (e.g. `"2026-05-31T23:59:59.999Z"`)        |
| `label`   | `string` | Human-readable label (e.g. `"May 2026"`, `"This Week"`, `"2026"`)             |

### `overview` Object

Ringkasan angka utama untuk summary cards.

| Field              | Type     | Description                                                |
|--------------------|----------|------------------------------------------------------------|
| `totalIncome`      | `number` | Total income di periode (minor units / cents)              |
| `totalExpense`     | `number` | Total expense di periode (minor units / cents)             |
| `netBalance`       | `number` | `totalIncome - totalExpense` (bisa negatif)                |
| `transactionCount` | `number` | Jumlah total transaksi (income + expense) di periode      |

**Contoh untuk frontend:**
- Card "Pemasukan" → `overview.totalIncome / 100` → display `Rp15.000.000`
- Card "Pengeluaran" → `overview.totalExpense / 100` → display `Rp12.500.000`
- Card "Saldo" → `overview.netBalance / 100` → display `Rp2.500.000`

### `comparison` Object

Perbandingan dengan periode sebelumnya. Digunakan untuk trend indicator (↑ / ↓).

| Field              | Type              | Description                                                |
|--------------------|-------------------|------------------------------------------------------------|
| `period`           | `object`          | Objek `period` untuk periode sebelumnya (lihat di atas)   |
| `totalIncome`      | `number`          | Total income periode sebelumnya (minor units)              |
| `totalExpense`     | `number`          | Total expense periode sebelumnya (minor units)             |
| `netBalance`       | `number`          | Net balance periode sebelumnya                             |
| `changePercent`    | `object`          | Persentase perubahan (lihat detail di bawah)               |

**`changePercent` fields:**

| Field        | Type           | Description                                                        |
|--------------|----------------|--------------------------------------------------------------------|
| `income`     | `number \| null` | `((currentIncome - prevIncome) / prevIncome) * 100`. `null` jika `prevIncome = 0` |
| `expense`    | `number \| null` | `((currentExpense - prevExpense) / prevExpense) * 100`. `null` jika `prevExpense = 0` |
| `netBalance` | `number \| null` | `((currentNet - prevNet) / abs(prevNet)) * 100`. `null` jika `prevNet = 0` |

> ⚠️ `changePercent.netBalance` menggunakan `abs(prevNet)` sebagai denominator supaya tidak infinity.

**Contoh response `comparison`:**
```json
{
  "period": {
    "start": "2026-04-01T00:00:00.000Z",
    "end": "2026-04-30T23:59:59.999Z",
    "label": "April 2026"
  },
  "totalIncome": 14000000,
  "totalExpense": 11000000,
  "netBalance": 3000000,
  "changePercent": {
    "income": 7.14,
    "expense": 13.64,
    "netBalance": -16.67
  }
}
```

### `byCategory` (array)

Breakdown transaksi per kategori. Digunakan untuk donut chart / ring chart.

**Array of objects, each containing:**

| Field                   | Type           | Description                                                |
|-------------------------|----------------|------------------------------------------------------------|
| `categoryId`            | `string`       | UUID kategori                                              |
| `name`                  | `string`       | Nama kategori                                              |
| `icon`                  | `string`       | Emoji / icon string dari kategori                          |
| `color`                 | `string`       | Hex color code (e.g. `"#FF6B6B"`)                          |
| `totalExpense`          | `number`       | Total expense di kategori ini (minor units)                |
| `totalIncome`           | `number`       | Total income di kategori ini (minor units)                 |
| `netExpense`            | `number`       | `totalExpense - totalIncome` untuk kategori ini            |
| `percentageOfExpense`   | `number`       | Persentase dari total keseluruhan expense (0–100)           |
| `transactionCount`      | `number`       | Jumlah transaksi di kategori ini                           |

> **Catatan**: Hanya kategori yang memiliki transaksi di periode tersebut yang dimasukkan. Kategori dengan 0 transaksi di-omit.

### `topSpendingCategories` (array)

Top 5 kategori dengan spending tertinggi — untuk chart donut utama.

**Array of objects:**

| Field        | Type     | Description                                                |
|--------------|----------|------------------------------------------------------------|
| `categoryId` | `string` | UUID kategori                                              |
| `name`       | `string` | Nama kategori                                              |
| `icon`       | `string` | Emoji / icon string                                         |
| `totalAmount`| `number` | Total amount (expense saja — income di-exclude) (minor units) |
| `percentage` | `number` | Persentase dari total expense (0–100)                       |

> Limit: **maksimal 5 kategori**. Jika ada lebih dari 5, yang lain digabung ke `"Other"` (optional, tergantung preferensi frontend).

### `recentTransactions` (array)

5 transaksi terbaru, untuk activity feed widget.

**Array of objects:**

| Field           | Type           | Description                                                |
|-----------------|----------------|------------------------------------------------------------|
| `id`            | `string`       | UUID transaksi                                             |
| `amount`        | `number`       | Amount dalam minor units (cents)                           |
| `type`          | `"income" \| "expense"` | Jenis transaksi                                    |
| `categoryId`    | `string \| null` | UUID kategori, `null` jika tidak dikategorikan          |
| `categoryName`  | `string \| null` | Nama kategori, `null` jika tidak dikategorikan          |
| `date`          | `string`       | ISO 8601 datetime                                          |
| `notes`         | `string \| null` | Catatan transaksi, `null` jika kosong                    |
| `tags`          | `string[]`     | Array tag (bisa kosong `[]`)                               |

---

## Error Responses

### `401 Unauthorized`

```json
{
  "success": false,
  "error": {
    "name": "UNAUTHORIZED",
    "message": "Unauthorized"
  }
}
```

### `422 Unprocessable Entity`

```json
{
  "success": false,
  "error": {
    "name": "VALIDATION_ERROR",
    "message": "Validation Error",
    "details": { ... }
  }
}
```

### `500 Internal Server Error`

```json
{
  "success": false,
  "error": {
    "name": "INTERNAL_ERROR",
    "message": "Internal server error"
  }
}
```

---

## Period Logic

### `period = "week"`

- **Start**: Senin minggu ini (locale-aware atau Monday-based)
- **End**: Minggu ini (23:59:59.999)
- **Previous**: Minggu lalu
- **Label**: `"This Week"` atau `"12–18 May 2026"`

### `period = "month"`

- **Start**: 1st of current month (00:00:00.000)
- **End**: Last day of current month (23:59:59.999)
- **Previous**: Bulan sebelumnya
- **Label**: `"May 2026"`
- **Optional `month` param**: Override ke bulan tertentu (`"2026-03"` → March 2026)

### `period = "year"`

- **Start**: 1 January of current year (00:00:00.000)
- **End**: 31 December of current year (23:59:59.999)
- **Previous**: Tahun sebelumnya
- **Label**: `"2026"`
- **Optional `year` param**: Override ke tahun tertentu (`"2025"` → Tahun 2025)

### `period = "all"`

- **Start**: Transaksi pertama yang dimiliki user (dari `createdAt` atau `date` paling awal)
- **End**: Sekarang (`new Date()`)
- **Previous**: Tidak ada → `comparison` di-`null`-kan
- **Label**: `"All Time"`

> **Special case**: Untuk `period=all`, field `comparison` di-response sebagai `null`.

---

## Database Queries (Service Layer)

### Overview & Comparison

Menggunakan **raw SQL aggregation** (Drizzle `sql` template literal) dalam **satu query**:

```sql
-- Current period
SELECT
  COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) AS total_income,
  COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS total_expense,
  COUNT(*) AS transaction_count
FROM transaction
WHERE user_id = :userId
  AND deleted_at IS NULL
  AND date >= :startDate AND date <= :endDate
```

Query terpisah untuk previous period, lalu di-compute `changePercent` di service layer.

### By Category

```sql
SELECT
  c.id AS category_id,
  c.name,
  c.icon,
  c.color,
  COALESCE(SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END), 0) AS total_expense,
  COALESCE(SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE 0 END), 0) AS total_income,
  COUNT(t.id) AS transaction_count
FROM category c
LEFT JOIN transaction t ON t.category_id = c.id
  AND t.user_id = :userId
  AND t.deleted_at IS NULL
  AND t.date >= :startDate AND t.date <= :endDate
WHERE c.user_id = :userId
GROUP BY c.id, c.name, c.icon, c.color
HAVING SUM(t.amount) IS NOT NULL
ORDER BY total_expense DESC
```

### Recent Transactions (Top 5)

```sql
SELECT id, amount, type, category_id, date, notes, tags
FROM transaction
WHERE user_id = :userId
  AND deleted_at IS NULL
  AND date >= :startDate AND date <= :endDate
ORDER BY date DESC, created_at DESC
LIMIT 5
```

### Top Spending Categories (Top 5)

Mengambil dari query `byCategory`, di-limit 5 di service layer.

---

## Implementation Plan

### Files to Create

```
src/modules/dashboard/
├── dashboard.schema.ts       # Zod schemas (query params + response types)
├── dashboard.service.ts      # Business logic + DB aggregation queries
├── dashboard.handlers.ts     # HTTP handlers (thin layer)
├── dashboard.routes.ts       # Route definitions + OpenAPI docs
├── dashboard.index.ts        # Router export (mounted in app.ts)
└── __tests__/
    ├── dashboard.service.test.ts    # Pure function tests (mock db)
    └── dashboard.handlers.test.ts   # Integration tests via app.request()
```

### Registration

Add to `src/modules/index.ts` and mount in `src/app.ts`:

```typescript
// src/app.ts
import { dashboardRouter } from "@/modules/dashboard";
app.route("/api/dashboard", dashboardRouter);
```

### Expected Dependencies

- `drizzle-orm` — raw SQL queries with `sql` template
- `@hono/zod-openapi` — route definitions + validation
- `stoker/http-status-codes` — named status codes
- `zod` — schema validation

---

## Notes

- `amount` disimpan dalam **minor units (cents)** di database (integer), sesuai pattern existing. Frontend melakukan `/ 100` untuk display.
- Response mengikuti pattern `{ success: true, data: ... }` yang konsisten dengan existing error response pattern `{ success: false, error: ... }`.
- Semua query **scoped ke `userId`** dari session.
- Soft-delete (`deletedAt`) sudah difilter di semua query.
- `categoryId` dan `categoryName` di `recentTransactions` bisa `null` karena foreign key optional (`onDelete: "set null"`).

---

## Questions for Review

1. Apakah `comparison` sebaiknya di-`null`-kan untuk `period=all`, atau dibandingkan dengan tahun sebelumnya? A: null saja jika belum ada
2. Apakah `recentTransactions` perlu include kategori info via join, atau cukup `categoryId` saja? A: cukup categoryId saja, category name di join table
3. Apakah `topSpendingCategories` max 5 fixed, atau configurable? A: fixed 5
4. Untuk `week` — Monday-based atau Sunday-based? A: Monday based
5. Apakah response perlu include `currency` field (hardcode `IDR`)? A: ya, tapi pake idr