import { describe, expect, test, mock } from "bun:test";

// Mock DB
mock.module("@/db", () => ({
  db: {
    query: {
      user: {
        findFirst: mock(() => ({
          id: "user-1",
          name: "John Doe",
          email: "john@example.com",
        })),
      },
    },
    update: mock(() => ({
      set: mock(() => ({
        where: mock(() => ({
          returning: mock(() => [
            { id: "user-1", name: "John Updated", email: "john@example.com" },
          ]),
        })),
      })),
    })),
    delete: mock(() => ({
      where: mock(() => ({
        returning: mock(() => [{ id: "user-1" }]),
      })),
    })),
  },
}));

import * as service from "../profile.service";

describe("profile.service", () => {
  test("getProfile returns user data", async () => {
    const result = await service.getProfile("user-1");
    expect(result?.name).toBe("John Doe");
  });

  test("updateProfile returns updated user data", async () => {
    const result = await service.updateProfile("user-1", {
      name: "John Updated",
    });
    expect(result.name).toBe("John Updated");
  });

  test("deleteAccount returns deleted id", async () => {
    const result = await service.deleteAccount("user-1");
    expect(result.id).toBe("user-1");
  });
});
