import { describe, expect, it } from "vitest";
import { areArraysOfPrimitiveEqual } from "./areArraysOfPrimitiveEqual";

describe("areArraysOfPrimitiveEqual", () => {
  describe("Empty arrays", () => {
    it("should return true for two empty arrays", () => {
      expect(areArraysOfPrimitiveEqual([], [])).toBe(true);
    });
  });

  describe("Arrays with different lengths", () => {
    it("should return false when arrays have different lengths", () => {
      expect(
        areArraysOfPrimitiveEqual([{ id: 1 }, { id: 2 }], [{ id: 1 }]),
      ).toBe(false);
      expect(
        areArraysOfPrimitiveEqual(
          [{ name: "test" }],
          [{ name: "test" }, { name: "other" }],
        ),
      ).toBe(false);
    });
  });

  describe("Simple object arrays", () => {
    it("should return true for identical object arrays", () => {
      const arr1 = [{ id: 1 }, { name: "test" }, { active: true }];
      const arr2 = [{ id: 1 }, { name: "test" }, { active: true }];
      expect(areArraysOfPrimitiveEqual(arr1, arr2)).toBe(true);
    });

    it("should return true for object arrays with same objects in different order", () => {
      const arr1 = [{ id: 1 }, { name: "test" }, { active: true }];
      const arr2 = [{ active: true }, { id: 1 }, { name: "test" }];
      expect(areArraysOfPrimitiveEqual(arr1, arr2)).toBe(true);
    });

    it("should return false for object arrays with different objects", () => {
      const arr1 = [{ id: 1 }, { name: "test" }];
      const arr2 = [{ id: 1 }, { name: "other" }];
      expect(areArraysOfPrimitiveEqual(arr1, arr2)).toBe(false);
    });
  });

  describe("Objects with multiple properties", () => {
    it("should compare objects with multiple properties correctly", () => {
      const arr1 = [
        { id: 1, name: "Alice", active: true },
        { id: 2, name: "Bob", active: false },
      ];
      const arr2 = [
        { id: 2, name: "Bob", active: false },
        { id: 1, name: "Alice", active: true },
      ];
      expect(areArraysOfPrimitiveEqual(arr1, arr2)).toBe(true);
    });

    it("should return false when objects have different property values", () => {
      const arr1 = [{ id: 1, name: "Alice", active: true }];
      const arr2 = [{ id: 1, name: "Alice", active: false }];
      expect(areArraysOfPrimitiveEqual(arr1, arr2)).toBe(false);
    });

    it("should return false when objects have different properties", () => {
      const arr1 = [{ id: 1, name: "Alice" }];
      const arr2 = [{ id: 1, email: "alice@test.com" }];
      expect(areArraysOfPrimitiveEqual(arr1, arr2)).toBe(false);
    });
  });

  describe("Objects with different property orders", () => {
    it("should treat objects with same properties in different order as equal", () => {
      const arr1 = [{ name: "Alice", id: 1, active: true }];
      const arr2 = [{ id: 1, active: true, name: "Alice" }];
      expect(areArraysOfPrimitiveEqual(arr1, arr2)).toBe(true);
    });
  });

  describe("Duplicate objects", () => {
    it("should handle duplicate objects correctly", () => {
      const arr1 = [{ id: 1 }, { id: 1 }, { id: 2 }];
      const arr2 = [{ id: 2 }, { id: 1 }, { id: 1 }];
      expect(areArraysOfPrimitiveEqual(arr1, arr2)).toBe(true);
    });

    it("should return false when duplicate counts don't match", () => {
      const arr1 = [{ id: 1 }, { id: 1 }, { id: 2 }];
      const arr2 = [{ id: 1 }, { id: 2 }, { id: 2 }];
      expect(areArraysOfPrimitiveEqual(arr1, arr2)).toBe(false);
    });

    it("should handle complex duplicate objects", () => {
      const obj1 = { name: "Alice", age: 30, active: true };
      const obj2 = { name: "Bob", age: 25, active: false };

      const arr1 = [obj1, obj2, obj1];
      const arr2 = [obj1, obj1, obj2];
      expect(areArraysOfPrimitiveEqual(arr1, arr2)).toBe(true);
    });
  });

  describe("Objects with null and undefined values", () => {
    it("should handle null values correctly", () => {
      const arr1 = [
        { id: 1, value: null },
        { id: 2, value: "test" },
      ];
      const arr2 = [
        { id: 2, value: "test" },
        { id: 1, value: null },
      ];
      expect(areArraysOfPrimitiveEqual(arr1, arr2)).toBe(true);
    });

    it("should handle undefined values correctly", () => {
      const arr1 = [
        { id: 1, value: undefined },
        { id: 2, value: "test" },
      ];
      const arr2 = [
        { id: 2, value: "test" },
        { id: 1, value: undefined },
      ];
      expect(areArraysOfPrimitiveEqual(arr1, arr2)).toBe(true);
    });

    it("should distinguish between null and undefined", () => {
      const arr1 = [{ id: 1, value: null }];
      const arr2 = [{ id: 1, value: undefined }];
      expect(areArraysOfPrimitiveEqual(arr1, arr2)).toBe(false);
    });
  });

  describe("Objects with different primitive types", () => {
    it("should handle string values", () => {
      const arr1 = [{ name: "Alice", type: "user" }];
      const arr2 = [{ type: "user", name: "Alice" }];
      expect(areArraysOfPrimitiveEqual(arr1, arr2)).toBe(true);
    });

    it("should handle number values", () => {
      const arr1 = [{ id: 42, score: 98.5 }];
      const arr2 = [{ score: 98.5, id: 42 }];
      expect(areArraysOfPrimitiveEqual(arr1, arr2)).toBe(true);
    });

    it("should handle boolean values", () => {
      const arr1 = [{ active: true, verified: false }];
      const arr2 = [{ verified: false, active: true }];
      expect(areArraysOfPrimitiveEqual(arr1, arr2)).toBe(true);
    });

    it("should handle mixed primitive types", () => {
      const arr1 = [{ id: 1, name: "test", active: true, score: null }];
      const arr2 = [{ active: true, score: null, id: 1, name: "test" }];
      expect(areArraysOfPrimitiveEqual(arr1, arr2)).toBe(true);
    });
  });

  describe("Edge cases", () => {
    it("should handle empty objects", () => {
      const arr1 = [{}];
      const arr2 = [{}];
      expect(areArraysOfPrimitiveEqual(arr1, arr2)).toBe(true);
    });

    it("should handle arrays with empty and non-empty objects", () => {
      const arr1 = [{}, { id: 1 }];
      const arr2 = [{ id: 1 }, {}];
      expect(areArraysOfPrimitiveEqual(arr1, arr2)).toBe(true);
    });

    it("should handle objects with zero values", () => {
      const arr1 = [{ count: 0, value: 0 }];
      const arr2 = [{ value: 0, count: 0 }];
      expect(areArraysOfPrimitiveEqual(arr1, arr2)).toBe(true);
    });

    it("should handle objects with empty string values", () => {
      const arr1 = [{ name: "", description: "" }];
      const arr2 = [{ description: "", name: "" }];
      expect(areArraysOfPrimitiveEqual(arr1, arr2)).toBe(true);
    });

    it("should distinguish between string and number types", () => {
      const arr1 = [{ id: "1" }];
      const arr2 = [{ id: 1 }];
      expect(areArraysOfPrimitiveEqual(arr1, arr2)).toBe(false);
    });
  });

  describe("Complex scenarios", () => {
    it("should handle arrays with many objects", () => {
      const arr1 = [
        { id: 1, name: "Alice" },
        { id: 2, name: "Bob" },
        { id: 3, name: "Charlie" },
        { id: 1, name: "Alice" },
      ];
      const arr2 = [
        { id: 2, name: "Bob" },
        { id: 1, name: "Alice" },
        { id: 1, name: "Alice" },
        { id: 3, name: "Charlie" },
      ];
      expect(areArraysOfPrimitiveEqual(arr1, arr2)).toBe(true);
    });

    it("should handle objects with many properties", () => {
      const obj1 = {
        id: 1,
        firstName: "John",
        lastName: "Doe",
        age: 30,
        isActive: true,
        score: 85.5,
        department: null,
        notes: undefined,
      };
      const obj2 = {
        lastName: "Doe",
        age: 30,
        id: 1,
        notes: undefined,
        firstName: "John",
        department: null,
        isActive: true,
        score: 85.5,
      };

      expect(areArraysOfPrimitiveEqual([obj1], [obj2])).toBe(true);
    });
  });

  describe("Performance considerations", () => {
    it("should handle moderately large arrays efficiently", () => {
      const size = 100;
      const arr1 = Array.from({ length: size }, (_, i) => ({
        id: i % 10,
        value: `item-${i % 10}`,
      }));
      const arr2 = [...arr1].reverse();

      expect(areArraysOfPrimitiveEqual(arr1, arr2)).toBe(true);
    });
  });
});
