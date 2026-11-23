import { describe, expect, it } from "vitest";
import { parseId } from "./ids";

describe("parseId", () => {
  it("accepts positive integers", () => {
    expect(parseId("1")).toBe(1);
    expect(parseId("2147483647")).toBe(2147483647);
  });

  it.each(["0", "-1", "1.5", "abc", "", "01", "2147483648"])(
    "rejects %j",
    (value) => {
      expect(parseId(value)).toBeNull();
    },
  );
});
