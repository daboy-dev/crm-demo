const eur = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
});

/** Formats euro cents for display, e.g. 123456 → "1234,56 €". */
export function formatEur(cents: number): string {
  return eur.format(cents / 100);
}

/**
 * Parses a user-typed euro amount into cents. Accepts "12", "12,5",
 * "12,50", "1.234,56" and "12.50". Returns null when it is not a valid
 * non-negative amount with at most two decimals.
 */
export function parseEurToCents(input: string): number | null {
  let value = input.trim().replace(/\s|€/g, "");
  if (value === "") return null;
  if (value.includes(",")) {
    // Spanish format: dots are thousands separators.
    value = value.replace(/\./g, "").replace(",", ".");
  }
  if (!/^\d+(\.\d{1,2})?$/.test(value)) return null;
  const [whole = "0", fraction = ""] = value.split(".");
  return Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
}

export const broken: number = "not a number";
