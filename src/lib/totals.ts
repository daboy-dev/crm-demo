/** A quote or invoice line. Prices are in euro cents, tax rate in whole %. */
export type LineInput = {
  quantity: number;
  unitPrice: number;
  taxRate: number;
};

export type Totals = {
  /** Base amount before tax (base imponible), in cents. */
  subtotal: number;
  /** IVA amount, in cents. */
  tax: number;
  /** subtotal + tax, in cents. */
  total: number;
};

/** Totals for one line. IVA is rounded to the cent per line. */
export function lineTotals(line: LineInput): Totals {
  const subtotal = line.quantity * line.unitPrice;
  const tax = Math.round((subtotal * line.taxRate) / 100);
  return { subtotal, tax, total: subtotal + tax };
}

/** Totals for a whole document: the sum of its line totals. */
export function documentTotals(lines: readonly LineInput[]): Totals {
  return lines.reduce<Totals>(
    (acc, line) => {
      const t = lineTotals(line);
      return {
        subtotal: acc.subtotal + t.subtotal,
        tax: acc.tax + t.tax,
        total: acc.total + t.total,
      };
    },
    { subtotal: 0, tax: 0, total: 0 },
  );
}
