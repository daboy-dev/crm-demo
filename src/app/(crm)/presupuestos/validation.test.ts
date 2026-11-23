import { describe, expect, it } from "vitest";
import { quoteSchema, readItems } from "./validation";

const valid = {
  clientId: "3",
  issuedAt: "2026-11-24",
  notes: "  ",
  items: [
    {
      description: "Diseño web",
      quantity: "2",
      unitPrice: "1.250,50",
      taxRate: "21",
    },
  ],
};

describe("quoteSchema", () => {
  it("parses a valid quote into cents", () => {
    expect(quoteSchema.parse(valid)).toEqual({
      clientId: 3,
      issuedAt: "2026-11-24",
      notes: null,
      items: [
        {
          description: "Diseño web",
          quantity: 2,
          unitPrice: 125050,
          taxRate: 21,
        },
      ],
    });
  });

  it("reports errors by line", () => {
    const result = quoteSchema.safeParse({
      ...valid,
      items: [
        { description: "", quantity: "0", unitPrice: "abc", taxRate: "7" },
      ],
    });
    expect(result.success).toBe(false);
    const paths = result.error?.issues.map((issue) => issue.path.join("."));
    expect(paths).toEqual([
      "items.0.description",
      "items.0.quantity",
      "items.0.unitPrice",
      "items.0.taxRate",
    ]);
  });

  it("requires at least one line and a client", () => {
    const result = quoteSchema.safeParse({ ...valid, clientId: "", items: [] });
    const paths = result.error?.issues.map((issue) => issue.path.join("."));
    expect(paths).toEqual(["clientId", "items"]);
  });
});

describe("readItems", () => {
  it("zips repeated inputs into lines", () => {
    const form = new FormData();
    for (const [d, q, p, t] of [
      ["A", "1", "10", "21"],
      ["B", "2", "5,5", "10"],
    ]) {
      form.append("description", d!);
      form.append("quantity", q!);
      form.append("unitPrice", p!);
      form.append("taxRate", t!);
    }
    expect(readItems(form)).toEqual([
      { description: "A", quantity: "1", unitPrice: "10", taxRate: "21" },
      { description: "B", quantity: "2", unitPrice: "5,5", taxRate: "10" },
    ]);
  });
});
