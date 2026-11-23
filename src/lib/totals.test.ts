import { describe, expect, it } from "vitest";
import { documentTotals, lineTotals } from "./totals";

describe("lineTotals", () => {
  it("applies IVA to quantity × unit price", () => {
    expect(lineTotals({ quantity: 3, unitPrice: 10000, taxRate: 21 })).toEqual({
      subtotal: 30000,
      tax: 6300,
      total: 36300,
    });
  });

  it("rounds IVA to the nearest cent", () => {
    // 0,99 € × 21 % = 0,2079 € → 0,21 €
    expect(lineTotals({ quantity: 1, unitPrice: 99, taxRate: 21 })).toEqual({
      subtotal: 99,
      tax: 21,
      total: 120,
    });
  });

  it("supports exempt lines", () => {
    expect(lineTotals({ quantity: 2, unitPrice: 500, taxRate: 0 }).tax).toBe(0);
  });
});

describe("documentTotals", () => {
  it("sums line totals, mixing tax rates", () => {
    expect(
      documentTotals([
        { quantity: 1, unitPrice: 100000, taxRate: 21 },
        { quantity: 4, unitPrice: 2500, taxRate: 10 },
      ]),
    ).toEqual({ subtotal: 110000, tax: 22000, total: 132000 });
  });

  it("is zero for no lines", () => {
    expect(documentTotals([])).toEqual({ subtotal: 0, tax: 0, total: 0 });
  });
});
