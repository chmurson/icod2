import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { StoreApi, UseBoundStore } from "zustand";
import {
  type OpenLockedBoxState,
  useOpenLockedBoxStore,
} from "@/stores/boxStore";
import { useInitiateCounter } from "./useInitiateCounter";

// Mock the store
vi.mock("@/stores/boxStore", () => ({
  useOpenLockedBoxStore: vi.fn(),
}));

const mockUseOpenLockedBoxStore = vi.mocked(
  useOpenLockedBoxStore as unknown as UseBoundStore<
    StoreApi<
      Pick<
        OpenLockedBoxState,
        "keyThreshold" | "shareAccessKeyMapByKeyholderId"
      >
    >
  >,
);

describe("useInitiateCounter", () => {
  const mockOnStart = vi.fn();
  const mockOnStop = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const renderUseInitiateCounter = () => {
    return renderHook(() =>
      useInitiateCounter({
        onStart: mockOnStart,
        onStop: mockOnStop,
      }),
    );
  };

  describe("when no one is sharing with anyone", () => {
    it("should not call any callbacks when threshold is not reached", () => {
      mockUseOpenLockedBoxStore.mockImplementation((selector) =>
        selector({
          keyThreshold: 3,
          shareAccessKeyMapByKeyholderId: {},
        }),
      );

      renderUseInitiateCounter();

      expect(mockOnStop).not.toHaveBeenCalled();
      expect(mockOnStart).not.toHaveBeenCalled();
    });
  });

  describe("when number of shares is smaller than keyThreshold", () => {
    it("should not call any callbacks when only 1 share exists but threshold is 3", () => {
      mockUseOpenLockedBoxStore.mockImplementation((selector) =>
        selector({
          keyThreshold: 3,
          shareAccessKeyMapByKeyholderId: {
            user1: {
              user2: true,
              user3: false,
            },
            user2: {
              user1: false,
              user3: false,
            },
          },
        }),
      );

      renderUseInitiateCounter();

      expect(mockOnStop).not.toHaveBeenCalled();
      expect(mockOnStart).not.toHaveBeenCalled();
    });

    it("should not call any callbacks when shares are distributed but no single user has enough", () => {
      mockUseOpenLockedBoxStore.mockImplementation((selector) =>
        selector({
          keyThreshold: 4,
          shareAccessKeyMapByKeyholderId: {
            user1: {
              user2: true,
              user3: true,
            },
            user2: {
              user1: true,
              user4: true,
            },
            user3: {
              user1: false,
              user4: false,
            },
          },
        }),
      );

      renderUseInitiateCounter();

      expect(mockOnStop).not.toHaveBeenCalled();
      expect(mockOnStart).not.toHaveBeenCalled();
    });
  });

  describe("when keyThreshold is reached", () => {
    it("should call onStart when exactly threshold-1 shares are reached", () => {
      const fixedDate = new Date("2024-01-01T12:00:00Z");
      vi.setSystemTime(fixedDate);

      mockUseOpenLockedBoxStore.mockImplementation((selector) =>
        selector({
          keyThreshold: 3,
          shareAccessKeyMapByKeyholderId: {
            user1: {
              user2: true,
              user3: false,
            },
            user3: {
              user2: true,
              user1: false,
            },
          },
        }),
      );

      renderUseInitiateCounter();

      expect(mockOnStart).toHaveBeenCalledTimes(1);
      expect(mockOnStart).toHaveBeenCalledWith(fixedDate);
      expect(mockOnStop).not.toHaveBeenCalled();
    });

    it("should call onStart when multiple users have threshold-1 shares", () => {
      // Both user2 and user3 receive 2 shares each (threshold-1)
      const fixedDate = new Date("2024-01-01T12:00:00Z");
      vi.setSystemTime(fixedDate);

      mockUseOpenLockedBoxStore.mockImplementation((selector) =>
        selector({
          keyThreshold: 3,
          shareAccessKeyMapByKeyholderId: {
            user1: {
              user2: true,
              user3: true,
            },
            user4: {
              user2: true,
              user3: true,
            },
            user5: {
              user1: false,
              user2: false,
            },
          },
        }),
      );

      renderUseInitiateCounter();

      expect(mockOnStart).toHaveBeenCalledTimes(1);
      expect(mockOnStart).toHaveBeenCalledWith(fixedDate);
      expect(mockOnStop).not.toHaveBeenCalled();
    });
  });

  describe("when shares are more than keyThreshold", () => {
    it("should call onStart when user has more shares than required", () => {
      // user2 receives 3 shares (from user1, user4, user5), which exceeds threshold-1=2
      const fixedDate = new Date("2024-01-01T12:00:00Z");
      vi.setSystemTime(fixedDate);

      mockUseOpenLockedBoxStore.mockImplementation((selector) =>
        selector({
          keyThreshold: 3,
          shareAccessKeyMapByKeyholderId: {
            user1: {
              user2: true,
              user3: false,
            },
            user4: {
              user2: true,
              user3: false,
            },
            user5: {
              user2: true,
              user3: false,
            },
          },
        }),
      );

      renderUseInitiateCounter();

      expect(mockOnStart).toHaveBeenCalledTimes(1);
      expect(mockOnStart).toHaveBeenCalledWith(fixedDate);
      expect(mockOnStop).not.toHaveBeenCalled();
    });
  });

  describe("when shares change and threshold is no longer met", () => {
    it("should call onStart first, then onStop when shares are removed", () => {
      // Test dynamic behavior: start when threshold reached, stop when it drops below
      const fixedDate = new Date("2024-01-01T12:00:00Z");
      vi.setSystemTime(fixedDate);

      // Initial state: threshold reached
      mockUseOpenLockedBoxStore.mockImplementation((selector) =>
        selector({
          keyThreshold: 3,
          shareAccessKeyMapByKeyholderId: {
            user1: {
              user2: true,
              user3: false,
            },
            user4: {
              user2: true,
              user3: false,
            },
          },
        }),
      );

      const { rerender } = renderUseInitiateCounter();

      expect(mockOnStart).toHaveBeenCalledTimes(1);
      expect(mockOnStart).toHaveBeenCalledWith(fixedDate);

      // Update state: threshold no longer reached
      mockUseOpenLockedBoxStore.mockImplementation((selector) =>
        selector({
          keyThreshold: 3,
          shareAccessKeyMapByKeyholderId: {
            user1: {
              user2: true,
              user3: false,
            },
            user4: {
              user2: false, // Share removed
              user3: false,
            },
          },
        }),
      );

      rerender();

      expect(mockOnStop).toHaveBeenCalledTimes(1);
      expect(mockOnStart).toHaveBeenCalledTimes(1); // Should not be called again
    });

    it("should handle complete removal of all shares", () => {
      const fixedDate = new Date("2024-01-01T12:00:00Z");
      vi.setSystemTime(fixedDate);

      // Initial state: threshold reached
      mockUseOpenLockedBoxStore.mockImplementation((selector) =>
        selector({
          keyThreshold: 3,
          shareAccessKeyMapByKeyholderId: {
            user1: {
              user2: true,
              user3: false,
            },
            user4: {
              user2: true,
              user3: false,
            },
          },
        }),
      );

      const { rerender } = renderUseInitiateCounter();

      expect(mockOnStart).toHaveBeenCalledTimes(1);

      // Update state: all shares removed
      mockUseOpenLockedBoxStore.mockImplementation((selector) =>
        selector({
          keyThreshold: 3,
          shareAccessKeyMapByKeyholderId: {},
        }),
      );

      rerender();

      expect(mockOnStop).toHaveBeenCalledTimes(1);
    });
  });

  describe("edge cases", () => {
    it("should handle keyThreshold of 1", () => {
      // With threshold=1, sharesRequiredToStartCounter=0, so any share triggers start
      const fixedDate = new Date("2024-01-01T12:00:00Z");
      vi.setSystemTime(fixedDate);

      mockUseOpenLockedBoxStore.mockImplementation((selector) =>
        selector({
          keyThreshold: 1,
          shareAccessKeyMapByKeyholderId: {
            user1: {
              user2: true,
            },
          },
        }),
      );

      renderUseInitiateCounter();

      // With threshold 1, sharesRequiredToStartCounter = 0, so any shares should trigger
      expect(mockOnStart).toHaveBeenCalledTimes(1);
      expect(mockOnStart).toHaveBeenCalledWith(fixedDate);
    });

    it("should not call any callbacks with empty shareAccessKeyMapByKeyholderId and higher threshold", () => {
      mockUseOpenLockedBoxStore.mockImplementation((selector) =>
        selector({
          keyThreshold: 5,
          shareAccessKeyMapByKeyholderId: {},
        }),
      );

      renderUseInitiateCounter();

      expect(mockOnStop).not.toHaveBeenCalled();
      expect(mockOnStart).not.toHaveBeenCalled();
    });

    it("should not call any callbacks with mixed true/false values below threshold", () => {
      mockUseOpenLockedBoxStore.mockImplementation((selector) =>
        selector({
          keyThreshold: 4,
          shareAccessKeyMapByKeyholderId: {
            user1: {
              user2: true,
              user3: false,
              user4: true,
              user5: false,
            },
            user6: {
              user2: true,
              user3: false,
              user4: false,
              user5: false,
            },
          },
        }),
      );

      renderUseInitiateCounter();

      expect(mockOnStop).not.toHaveBeenCalled();
      expect(mockOnStart).not.toHaveBeenCalled();
    });

    it("should use stable references for callbacks", () => {
      const fixedDate = new Date("2024-01-01T12:00:00Z");
      vi.setSystemTime(fixedDate);

      mockUseOpenLockedBoxStore.mockImplementation((selector) =>
        selector({
          keyThreshold: 3,
          shareAccessKeyMapByKeyholderId: {
            user1: {
              user2: true,
              user3: false,
            },
            user4: {
              user2: true,
              user3: false,
            },
          },
        }),
      );

      const { rerender } = renderUseInitiateCounter();

      expect(mockOnStart).toHaveBeenCalledTimes(1);
      expect(mockOnStop).not.toHaveBeenCalled();

      rerender();

      expect(mockOnStart).toHaveBeenCalledTimes(1);
      expect(mockOnStop).not.toHaveBeenCalled();
    });
  });

  describe("complex sharing scenarios", () => {
    it("should handle asymmetric sharing correctly", () => {
      // Test that sharing is counted correctly even when it's not reciprocal
      const fixedDate = new Date("2024-01-01T12:00:00Z");
      vi.setSystemTime(fixedDate);

      mockUseOpenLockedBoxStore.mockImplementation((selector) =>
        selector({
          keyThreshold: 3,
          shareAccessKeyMapByKeyholderId: {
            user1: {
              user2: true,
              user3: true,
              user4: false,
            },
            user5: {
              user2: true, // user2 receives from user1 and user5 = 2 shares (threshold-1)
              user3: false,
              user4: false,
            },
            user3: {
              user1: false,
              user2: false,
              user4: false,
            },
          },
        }),
      );

      renderUseInitiateCounter();

      // user2 receives 2 shares (from user1 and user5), which equals threshold-1
      expect(mockOnStart).toHaveBeenCalledTimes(1);
      expect(mockOnStart).toHaveBeenCalledWith(fixedDate);
    });

    it("should handle large number of users", () => {
      // Test performance and correctness with many users
      const shareMap: Record<string, Record<string, boolean>> = {};

      // Create scenario where user2 receives enough shares
      // We need threshold-1 = 4 users to share with user2
      for (let i = 1; i <= 10; i++) {
        shareMap[`user${i}`] = {};
        for (let j = 1; j <= 10; j++) {
          if (i !== j) {
            // Users 1,3,4,5 share with user2, giving user2 exactly 4 shares (threshold-1)
            shareMap[`user${i}`][`user${j}`] = i <= 5 && j === 2 && i !== 2;
          }
        }
      }

      const fixedDate = new Date("2024-01-01T12:00:00Z");
      vi.setSystemTime(fixedDate);

      mockUseOpenLockedBoxStore.mockImplementation((selector) =>
        selector({
          keyThreshold: 5,
          shareAccessKeyMapByKeyholderId: shareMap,
        }),
      );

      renderUseInitiateCounter();

      // user2 receives 4 shares (from user1,3,4,5), which equals threshold-1
      expect(mockOnStart).toHaveBeenCalledTimes(1);
      expect(mockOnStart).toHaveBeenCalledWith(fixedDate);
    });
  });
});
