// @vitest-environment node
import { describe, expect, it } from "vitest";
import { safeReturnTo } from "@/server/auth";

describe("safeReturnTo", () => {
  it("keeps same-site paths", () => {
    expect(safeReturnTo("/users/3?view=table")).toBe("/users/3?view=table");
  });

  it("falls back to /users for anything that could leave the site", () => {
    for (const value of [null, "", "https://evil.example", "//evil.example", "/\\evil.example"]) {
      expect(safeReturnTo(value)).toBe("/users");
    }
  });
});
