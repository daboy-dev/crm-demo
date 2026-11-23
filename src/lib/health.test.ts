import { describe, expect, it, vi } from "vitest";
import { checkHealth } from "./health";

describe("checkHealth", () => {
  it("reports ok when the database answers", async () => {
    const pingDb = vi.fn().mockResolvedValue(undefined);

    const report = await checkHealth({ pingDb, version: "1.2.3" });

    expect(pingDb).toHaveBeenCalledOnce();
    expect(report).toEqual({ ok: true, db: true, version: "1.2.3" });
  });

  it("reports not ok when the database fails", async () => {
    const pingDb = vi.fn().mockRejectedValue(new Error("connection refused"));

    const report = await checkHealth({ pingDb, version: "1.2.3" });

    expect(report).toEqual({ ok: false, db: false, version: "1.2.3" });
  });
});
