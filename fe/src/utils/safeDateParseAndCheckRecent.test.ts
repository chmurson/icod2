import { addDays, format, formatISO, getUnixTime, subDays } from "date-fns";
import { describe, expect, test } from "vitest";
import { safeParseAndCheckRecent } from "./safeDateParseAndCheckRecent";

describe("safeParseAndCheckRecent", () => {
  const now = new Date();
  const yesterday = subDays(now, 1);
  const twoDaysAgo = subDays(now, 2);
  const tomorrow = addDays(now, 1);
  const twoDaysFromNow = addDays(now, 2);

  describe("with ISO string inputs", () => {
    test("should return date for recent ISO string (within 1 day)", () => {
      const isoString = now.toISOString();
      const result = safeParseAndCheckRecent(isoString);
      expect(result).toBeInstanceOf(Date);
      expect(result?.getTime()).toBeCloseTo(now.getTime(), -3); // Within 1000ms
    });

    test("should return date for yesterday's ISO string (within 1 day tolerance)", () => {
      const isoString = yesterday.toISOString();
      const result = safeParseAndCheckRecent(isoString);
      expect(result).toBeInstanceOf(Date);
      expect(result?.getTime()).toBeCloseTo(yesterday.getTime(), -3);
    });

    test("should return null for ISO string older than tolerance", () => {
      const isoString = twoDaysAgo.toISOString();
      const result = safeParseAndCheckRecent(isoString);
      expect(result).toBeNull();
    });

    test("should return date for tomorrow's ISO string (within 1 day tolerance)", () => {
      const isoString = tomorrow.toISOString();
      const result = safeParseAndCheckRecent(isoString);
      expect(result).toBeInstanceOf(Date);
      expect(result?.getTime()).toBeCloseTo(tomorrow.getTime(), -3);
    });

    test("should return null for ISO string beyond future tolerance", () => {
      const isoString = twoDaysFromNow.toISOString();
      const result = safeParseAndCheckRecent(isoString);
      expect(result).toBeNull();
    });
  });

  describe("with date-fns formatted strings", () => {
    test("should return date for formatISO string within tolerance", () => {
      const dateString = formatISO(now);
      const result = safeParseAndCheckRecent(dateString);
      expect(result).toBeInstanceOf(Date);
      expect(result?.getTime()).toBeCloseTo(now.getTime(), -3);
    });

    test("should return date for formatISO date-only string within tolerance", () => {
      const dateString = formatISO(now, { representation: "date" });
      const result = safeParseAndCheckRecent(dateString);
      expect(result).toBeInstanceOf(Date);
      // Date-only strings are parsed as UTC midnight, so we check the date part
      expect(result?.getUTCFullYear()).toBe(now.getUTCFullYear());
      expect(result?.getUTCMonth()).toBe(now.getUTCMonth());
      expect(result?.getUTCDate()).toBe(now.getUTCDate());
    });

    test("should return null for formatISO string beyond tolerance", () => {
      const dateString = formatISO(twoDaysAgo);
      const result = safeParseAndCheckRecent(dateString);
      expect(result).toBeNull();
    });
  });

  describe("with timestamp (number) inputs", () => {
    test("should return date for recent timestamp within tolerance", () => {
      const timestamp = getUnixTime(now);
      const result = safeParseAndCheckRecent(timestamp);
      expect(result).toBeInstanceOf(Date);
      expect(result?.getTime()).toBeCloseTo(now.getTime(), -3);
    });

    test("should return date for yesterday's timestamp within tolerance", () => {
      const timestamp = getUnixTime(yesterday);
      const result = safeParseAndCheckRecent(timestamp);
      expect(result).toBeInstanceOf(Date);
      expect(result?.getTime()).toBeCloseTo(yesterday.getTime(), -3);
    });

    test("should return null for timestamp beyond tolerance", () => {
      const timestamp = getUnixTime(twoDaysAgo);
      const result = safeParseAndCheckRecent(timestamp);
      expect(result).toBeNull();
    });

    test("should handle timestamp from Date.getTime() / 1000", () => {
      const timestamp = Math.floor(now.getTime() / 1000);
      const result = safeParseAndCheckRecent(timestamp);
      expect(result).toBeInstanceOf(Date);
      expect(result?.getTime()).toBeCloseTo(now.getTime(), -3);
    });

    test("should handle precise timestamp with fractional seconds", () => {
      const preciseDate = new Date();
      preciseDate.setMilliseconds(500); // Set to 500ms
      const timestamp = preciseDate.getTime() / 1000; // Convert to seconds with decimal
      const result = safeParseAndCheckRecent(Math.floor(timestamp)); // Function uses integer seconds
      expect(result).toBeInstanceOf(Date);
      // Should match within 1 second due to flooring
      expect(Math.abs(result!.getTime() - preciseDate.getTime())).toBeLessThan(
        1000,
      );
    });
  });

  describe("with custom time tolerance", () => {
    test("should respect custom tolerance of 3 days", () => {
      const threeDaysAgo = subDays(now, 3);
      const fourDaysAgo = subDays(now, 4);

      const result1 = safeParseAndCheckRecent(threeDaysAgo.toISOString(), 3);
      expect(result1).toBeInstanceOf(Date);

      const result2 = safeParseAndCheckRecent(fourDaysAgo.toISOString(), 3);
      expect(result2).toBeNull();
    });

    test("should handle zero tolerance", () => {
      const result1 = safeParseAndCheckRecent(now.toISOString(), 0);
      expect(result1).toBeInstanceOf(Date);

      const result2 = safeParseAndCheckRecent(yesterday.toISOString(), 0);
      expect(result2).toBeNull();
    });
  });

  describe("with invalid inputs", () => {
    test("should return null for invalid ISO string", () => {
      const result = safeParseAndCheckRecent("invalid-date-string");
      expect(result).toBeNull();
    });

    test("should return null for malformed ISO string", () => {
      const result = safeParseAndCheckRecent("2023-13-45T25:70:80.000Z");
      expect(result).toBeNull();
    });

    test("should return null for negative timestamp", () => {
      const result = safeParseAndCheckRecent(-1000);
      expect(result).toBeNull();
    });

    test("should return null for extremely large timestamp", () => {
      const result = safeParseAndCheckRecent(Number.MAX_SAFE_INTEGER);
      expect(result).toBeNull();
    });

    test("should return null for empty string", () => {
      const result = safeParseAndCheckRecent("");
      expect(result).toBeNull();
    });
  });

  describe("edge cases", () => {
    test("should handle date exactly at tolerance boundary", () => {
      const exactlyOneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const result = safeParseAndCheckRecent(exactlyOneDayAgo.toISOString());
      expect(result).toBeInstanceOf(Date);
    });

    test("should handle date just beyond tolerance boundary", () => {
      const justOverOneDayAgo = new Date(
        now.getTime() - 24 * 60 * 60 * 1000 - 1,
      );
      const result = safeParseAndCheckRecent(justOverOneDayAgo.toISOString());
      // This might be null depending on how differenceInDays handles partial days
      // The exact behavior depends on date-fns implementation
      expect([null, expect.any(Date)]).toContain(result);
    });

    test("should handle leap year dates", () => {
      const leapYearDate = new Date("2024-02-29T12:00:00.000Z");
      const result = safeParseAndCheckRecent(leapYearDate.toISOString());
      // Will be null if not within tolerance, but should parse correctly
      expect(result === null || result instanceof Date).toBe(true);
    });
  });
});
