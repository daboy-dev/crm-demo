export type DocumentPrefix = "P" | "F";

/** Builds a document number, e.g. ("P", 2026, 7) → "P-2026-007". */
export function formatDocumentNumber(
  prefix: DocumentPrefix,
  year: number,
  sequence: number,
): string {
  return `${prefix}-${year}-${String(sequence).padStart(3, "0")}`;
}

/**
 * Next number of the year given the existing numbers with the same prefix
 * and year (e.g. the result of a `LIKE 'P-2026-%'` query).
 */
export function nextDocumentNumber(
  prefix: DocumentPrefix,
  year: number,
  existing: readonly string[],
): string {
  const pattern = new RegExp(`^${prefix}-${year}-(\\d+)$`);
  const max = existing.reduce((acc, number) => {
    const match = pattern.exec(number);
    return match?.[1] ? Math.max(acc, Number(match[1])) : acc;
  }, 0);
  return formatDocumentNumber(prefix, year, max + 1);
}
