import { describe, expect, test, mock } from "bun:test";

import * as service from "@/modules/categories/categories.service";

describe("categories.service", () => {
  const createDbMock = () => ({
    insert: mock(() => ({
      values: mock(() => ({
        returning: mock(() => [
          {
            id: "550e8400-e29b-41d4-a716-446655440001",
            name: "Food",
            userId: "user-1",
            parentId: null,
          },
        ]),
      })),
    })),
    query: {
      category: {
        findMany: mock(() => [
          {
            id: "550e8400-e29b-41d4-a716-446655440001",
            name: "Food",
            userId: "user-1",
            parentId: null,
          },
        ]),
        findFirst: mock(() => ({
          id: "550e8400-e29b-41d4-a716-446655440001",
          name: "Food",
          userId: "user-1",
          parentId: null,
        })),
      },
    },
    update: mock(() => ({
      set: mock(() => ({
        where: mock(() => ({
          returning: mock(() => [
            {
              id: "550e8400-e29b-41d4-a716-446655440001",
              name: "Groceries",
              userId: "user-1",
              parentId: null,
            },
          ]),
        })),
      })),
    })),
    delete: mock(() => ({
      where: mock(() => ({
        returning: mock(() => [{ id: "550e8400-e29b-41d4-a716-446655440001" }]),
      })),
    })),
  });

  test("createCategory returns created category", async () => {
    const db = createDbMock();
    const data = { name: "Food" };
    const userId = "user-1";
    const result = await service.createCategory(data, userId, db as never);
    expect(result.name).toBe("Food");
    expect(result.userId).toBe(userId);
  });

  test("getCategories returns list of categories", async () => {
    const db = createDbMock();
    const userId = "user-1";
    const result = await service.getCategories(userId, db as never);
    expect(Array.isArray(result)).toBe(true);
    expect(result[0].name).toBe("Food");
  });

  test("getCategoryById returns a single category", async () => {
    const db = createDbMock();
    const result = await service.getCategoryById(
      "550e8400-e29b-41d4-a716-446655440001",
      "user-1",
      db as never,
    );
    expect(result?.id).toBe("550e8400-e29b-41d4-a716-446655440001");
  });

  test("updateCategory returns updated category", async () => {
    const db = createDbMock();
    const result = await service.updateCategory(
      "550e8400-e29b-41d4-a716-446655440001",
      "user-1",
      {
        name: "Groceries",
      },
      db as never,
    );
    expect(result?.name).toBe("Groceries");
  });

  test("deleteCategory returns deleted id", async () => {
    const db = createDbMock();
    const result = await service.deleteCategory(
      "550e8400-e29b-41d4-a716-446655440001",
      "user-1",
      db as never,
    );
    expect(result?.id).toBe("550e8400-e29b-41d4-a716-446655440001");
  });
});
