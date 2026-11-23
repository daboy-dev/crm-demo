import { describe, expect, it } from "vitest";
import {
  SESSION_MAX_AGE_SECONDS,
  createSessionToken,
  safeEqual,
  verifySessionToken,
} from "./auth";

const SECRET = "test-secret";
const NOW = new Date("2026-11-24T10:00:00Z");

describe("session tokens", () => {
  it("round-trips the user", async () => {
    const token = await createSessionToken("demo", SECRET, NOW);
    expect(await verifySessionToken(token, SECRET, NOW)).toBe("demo");
  });

  it("rejects a token signed with another secret", async () => {
    const token = await createSessionToken("demo", "other", NOW);
    expect(await verifySessionToken(token, SECRET, NOW)).toBeNull();
  });

  it("rejects a tampered payload", async () => {
    const token = await createSessionToken("demo", SECRET, NOW);
    const [, signature] = token.split(".");
    const forged = btoa(JSON.stringify({ user: "admin", exp: 9e9 })).replace(
      /=+$/,
      "",
    );
    expect(
      await verifySessionToken(`${forged}.${signature}`, SECRET, NOW),
    ).toBeNull();
  });

  it("rejects an expired token", async () => {
    const token = await createSessionToken("demo", SECRET, NOW);
    const later = new Date(
      NOW.getTime() + (SESSION_MAX_AGE_SECONDS + 1) * 1000,
    );
    expect(await verifySessionToken(token, SECRET, later)).toBeNull();
  });

  it.each([undefined, "", "abc", "a.b.c", "!!.??"])(
    "rejects malformed token %j",
    async (token) => {
      expect(await verifySessionToken(token, SECRET, NOW)).toBeNull();
    },
  );
});

describe("safeEqual", () => {
  it("compares strings", async () => {
    expect(await safeEqual("demo", "demo", SECRET)).toBe(true);
    expect(await safeEqual("demo", "demO", SECRET)).toBe(false);
    expect(await safeEqual("demo", "", SECRET)).toBe(false);
  });
});
