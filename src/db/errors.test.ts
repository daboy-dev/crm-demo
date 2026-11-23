import { describe, expect, it } from "vitest";
import { uniqueViolation } from "./errors";

describe("uniqueViolation", () => {
  it("reads the constraint from a driver error", () => {
    expect(
      uniqueViolation({ code: "23505", constraint: "clients_email_unique" }),
    ).toBe("clients_email_unique");
  });

  it("looks through wrapped errors", () => {
    const cause = { code: "23505", constraint: "quotes_number_unique" };
    expect(uniqueViolation(new Error("query failed", { cause }))).toBe(
      "quotes_number_unique",
    );
  });

  it("ignores other errors", () => {
    expect(uniqueViolation(new Error("boom"))).toBeNull();
    expect(uniqueViolation({ code: "23503" })).toBeNull();
    expect(uniqueViolation(null)).toBeNull();
  });
});
