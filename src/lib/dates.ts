const TIME_ZONE = "Europe/Madrid";

const display = new Intl.DateTimeFormat("es-ES", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: "UTC",
});

/** Formats a calendar date (`YYYY-MM-DD`) as "24/11/2026". */
export function formatDate(isoDate: string): string {
  return display.format(new Date(`${isoDate}T00:00:00Z`));
}

/** Today's calendar date in Spain, as `YYYY-MM-DD`. */
export function todayIso(now: Date = new Date()): string {
  // en-CA formats dates as YYYY-MM-DD.
  return new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE }).format(now);
}

/** Adds whole days to a calendar date (`YYYY-MM-DD`). */
export function addDays(isoDate: string, days: number): string {
  const date = new Date(`${isoDate}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

/**
 * True when an invoice is still pending and its due date (`YYYY-MM-DD`) is
 * before today. `today` can be a date string or a function returning one.
 */
export function isOverdue(
  dueAt: string,
  status: string,
  today: string | (() => string) = () => todayIso(),
): boolean {
  const now = typeof today === "function" ? today() : today;
  return status === "pending" && dueAt < now;
}
