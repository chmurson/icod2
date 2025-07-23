import { describe, expect, test } from "vitest";
import { hasSameTrueKeys } from "./hasSameTrueKeys";

// Test cases to demonstrate the hasSameTrueKeys function
describe("hasSameTrueKeys", () => {
  test("should return true for identical objects", () => {
    const obj1 = {
      a: { x: true, y: false },
      b: { z: true },
    };
    const obj2 = {
      a: { x: true, y: false },
      b: { z: true },
    };
    expect(hasSameTrueKeys(obj1, obj2)).toBe(true);
  });

  test("should treat false and undefined as equal", () => {
    const obj1 = {
      a: { x: true, y: false },
      b: { w: false },
    };
    const obj2 = {
      a: { x: true, z: false },
      b: {},
    };
    expect(hasSameTrueKeys(obj1, obj2)).toBe(true);
  });

  test("should return false for different boolean values", () => {
    const obj1 = {
      a: { x: true },
      b: { y: false },
    };
    const obj2 = {
      a: { x: false },
      b: { y: true },
    };
    expect(hasSameTrueKeys(obj1, obj2)).toBe(false);
  });

  test("should handle missing keys in nested objects", () => {
    const obj1 = {
      a: { x: true },
      b: { y: false },
    };
    const obj2 = {
      a: { x: true },
      b: { y: false },
    };
    expect(hasSameTrueKeys(obj1, obj2)).toBe(true);
  });

  test("should handle missing top-level keys", () => {
    const obj1 = {
      a: { x: true },
      b: { y: false },
    };
    const obj2 = {
      a: { x: true },
      b: { y: false },
      c: {},
    };
    expect(hasSameTrueKeys(obj1, obj2)).toBe(true);
  });

  test("should return true when nested objects are missing", () => {
    const obj1 = {
      a: { x: true },
      b: { y: false },
    };
    const obj2 = {
      a: { x: true },
    };
    expect(hasSameTrueKeys(obj1, obj2)).toBe(true);
  });

  test("should handle empty objects", () => {
    const obj1 = {};
    const obj2 = {};
    expect(hasSameTrueKeys(obj1, obj2)).toBe(true);
  });

  test("should handle objects with empty nested objects", () => {
    const obj1 = {
      a: {},
      b: { x: false },
    };
    const obj2 = {
      a: {},
      b: {},
    };
    expect(hasSameTrueKeys(obj1, obj2)).toBe(true);
  });
});
