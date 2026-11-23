import { describe, expect, it } from "vitest";
import { formatEur, parseEurToCents } from "./money";

// Intl uses non-breaking spaces; normalise them to compare.
const plain = (s: string) => s.replace(/\s/g, " ");

describe("formatEur", () => {
  it("formats cents as euros in es-ES", () => {
    expect(plain(formatEur(123456))).toBe("1234,56 €");
    expect(plain(formatEur(1234567))).toBe("12.345,67 €");
    expect(plain(formatEur(5))).toBe("0,05 €");
  });
});

describe("parseEurToCents", () => {
  it.each([
    ["12", 1200],
    ["12,5", 1250],
    ["12,50", 1250],
    ["1.234,56", 123456],
    ["12.50", 1250],
    [" 80 € ", 8000],
    ["0", 0],
  ])("parses %j as %i cents", (input, cents) => {
    expect(parseEurToCents(input)).toBe(cents);
  });

  it.each(["", "abc", "-5", "1,234", "12,345,6"])("rejects %j", (input) => {
    expect(parseEurToCents(input)).toBeNull();
  });
});
