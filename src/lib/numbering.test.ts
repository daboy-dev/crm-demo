import { describe, expect, it } from "vitest";
import { formatDocumentNumber, nextDocumentNumber } from "./numbering";

describe("formatDocumentNumber", () => {
  it("pads the sequence to three digits", () => {
    expect(formatDocumentNumber("P", 2026, 1)).toBe("P-2026-001");
    expect(formatDocumentNumber("F", 2026, 1234)).toBe("F-2026-1234");
  });
});

describe("nextDocumentNumber", () => {
  it("starts at 001", () => {
    expect(nextDocumentNumber("F", 2026, [])).toBe("F-2026-001");
  });

  it("continues after the highest number, ignoring other years", () => {
    expect(
      nextDocumentNumber("P", 2026, ["P-2026-002", "P-2026-010", "P-2025-099"]),
    ).toBe("P-2026-011");
  });
});
