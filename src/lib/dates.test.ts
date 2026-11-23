import { describe, expect, it } from "vitest";
import { addDays, formatDate, todayIso } from "./dates";

describe("formatDate", () => {
  it("formats calendar dates as dd/mm/yyyy", () => {
    expect(formatDate("2026-11-24")).toBe("24/11/2026");
    expect(formatDate("2026-01-05")).toBe("05/01/2026");
  });
});

describe("todayIso", () => {
  it("uses the Spanish calendar day", () => {
    // 23:30 UTC on 31 Dec is already 1 Jan in Madrid.
    expect(todayIso(new Date("2026-12-31T23:30:00Z"))).toBe("2027-01-01");
    expect(todayIso(new Date("2026-06-15T10:00:00Z"))).toBe("2026-06-15");
  });
});

describe("addDays", () => {
  it("crosses month and year boundaries", () => {
    expect(addDays("2026-01-31", 1)).toBe("2026-02-01");
    expect(addDays("2026-12-15", 30)).toBe("2027-01-14");
  });
});
