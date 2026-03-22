import { mock, describe, expect, test } from "bun:test";

// Mock DB to avoid real DB connection in unit tests for pure functions
mock.module("@/db", () => ({ db: {} }));

import { isEmailAllowed } from "../auth.service";

describe("isEmailAllowed", () => {
  test("returns true when email is in the allowlist", () => {
    expect(isEmailAllowed("example@gmail.com", ["example@gmail.com"])).toBe(
      true,
    );
  });

  test("returns false when email is NOT in the allowlist", () => {
    expect(isEmailAllowed("other@gmail.com", ["example@gmail.com"])).toBe(
      false,
    );
  });

  test("is case-insensitive", () => {
    expect(isEmailAllowed("EXAMPLE@GMAIL.COM", ["example@gmail.com"])).toBe(
      true,
    );
  });

  test("works with multiple allowed emails", () => {
    const allowed = ["example@gmail.com", "another@gmail.com"];
    expect(isEmailAllowed("another@gmail.com", allowed)).toBe(true);
    expect(isEmailAllowed("notlisted@gmail.com", allowed)).toBe(false);
  });

  test("returns false for empty email", () => {
    expect(isEmailAllowed("", ["example@gmail.com"])).toBe(false);
  });

  test("returns false when allowlist is empty", () => {
    expect(isEmailAllowed("example@gmail.com", [])).toBe(false);
  });

  test("trims whitespace from both sides before comparing", () => {
    expect(isEmailAllowed(" example@gmail.com ", ["example@gmail.com"])).toBe(
      true,
    );
  });
});
