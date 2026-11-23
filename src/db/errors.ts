/**
 * If `error` is a Postgres unique violation (23505), returns the name of the
 * violated constraint, e.g. "quotes_number_unique". Otherwise null.
 * Drizzle wraps driver errors, so the code may live on `cause`.
 */
export function uniqueViolation(error: unknown): string | null {
  let current: unknown = error;
  for (let depth = 0; depth < 3 && current; depth++) {
    if (typeof current === "object" && "code" in current) {
      const { code, constraint } = current as {
        code?: unknown;
        constraint?: unknown;
      };
      if (code === "23505") {
        return typeof constraint === "string" ? constraint : "";
      }
    }
    current =
      typeof current === "object" && "cause" in current
        ? (current as { cause?: unknown }).cause
        : null;
  }
  return null;
}
