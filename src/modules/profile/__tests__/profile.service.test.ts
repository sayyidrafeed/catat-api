import { describe, expect, test, mock } from "bun:test";

import * as service from "@/modules/profile/profile.service";

describe("profile.service", () => {
  const createDbMock = () => ({
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
  });

  test("getProfile returns user data", async () => {
    const db = createDbMock();
    const result = await service.getProfile("user-1", db as never);
    expect(result?.name).toBe("John Doe");
  });

  test("updateProfile returns updated user data", async () => {
    const db = createDbMock();
    const result = await service.updateProfile(
      "user-1",
      {
        name: "John Updated",
      },
      db as never,
    );
    expect(result?.name).toBe("John Updated");
  });

  test("deleteAccount returns deleted id", async () => {
    const db = createDbMock();
    const result = await service.deleteAccount("user-1", db as never);
    expect(result?.id).toBe("user-1");
  });
});
