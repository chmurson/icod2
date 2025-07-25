import { renderHook } from "@testing-library/react";

import type { StoreApi, UseBoundStore } from "zustand";
import {
  type OpenLockedBoxState,
  useOpenLockedBoxStore,
} from "@/stores/boxStore";
import { useShareKeyWithParticipants } from "./useShareKeyWithParticipants";

vi.mock("@/stores/boxStore", () => ({
  useOpenLockedBoxStore: vi.fn(),
}));

const mockUseOpenLockedBoxStore = vi.mocked(
  useOpenLockedBoxStore as unknown as UseBoundStore<
    StoreApi<
      Pick<OpenLockedBoxState, "shareAccessKeyByKeyHolderId" | "state" | "you">
    >
  >,
);

describe("useShareKeyWithParticipants", () => {
  const mockSendKey = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const renderUseShareKeyWithParticipants = () => {
    return renderHook(() => useShareKeyWithParticipants(mockSendKey));
  };

  describe("when state is ready-to-unlock and some participants are selected", () => {
    it("should call sendKey with the selected participant ids", () => {
      mockUseOpenLockedBoxStore.mockImplementation((selector) =>
        selector({
          state: "ready-to-unlock",
          shareAccessKeyByKeyHolderId: {
            user1: true,
            user2: false,
            user3: true,
          },
          you: { id: "user4", name: "User 4", userAgent: "Agent 4" },
        }),
      );

      renderUseShareKeyWithParticipants();

      expect(mockSendKey).toHaveBeenCalledTimes(1);
      expect(mockSendKey).toHaveBeenCalledWith(["user1", "user3"]);
    });
  });

  describe("when state is not ready-to-unlock and no participants are selected", () => {
    it("should not call sendKey", () => {
      mockUseOpenLockedBoxStore.mockImplementation((selector) =>
        selector({
          state: "connected",
          shareAccessKeyByKeyHolderId: {
            user1: false,
            user2: false,
          },
          you: { id: "user4", name: "User 4", userAgent: "Agent 4" },
        }),
      );

      renderUseShareKeyWithParticipants();

      expect(mockSendKey).not.toHaveBeenCalled();
    });
  });

  describe("when state is ready-to-unlock but no participants are selected", () => {
    it("should not call sendKey", () => {
      mockUseOpenLockedBoxStore.mockImplementation((selector) =>
        selector({
          state: "ready-to-unlock",
          shareAccessKeyByKeyHolderId: {
            user1: false,
            user2: false,
          },
          you: { id: "user4", name: "User 4", userAgent: "Agent 4" },
        }),
      );

      renderUseShareKeyWithParticipants();

      expect(mockSendKey).not.toHaveBeenCalled();
    });
  });

  describe("when state is not ready-to-unlock but some participants are selected", () => {
    it("should not call sendKey", () => {
      mockUseOpenLockedBoxStore.mockImplementation((selector) =>
        selector({
          state: "connected",
          shareAccessKeyByKeyHolderId: {
            user1: true,
            user2: true,
          },
          you: { id: "user4", name: "User 4", userAgent: "Agent 4" },
        }),
      );

      renderUseShareKeyWithParticipants();

      expect(mockSendKey).not.toHaveBeenCalled();
    });
  });

  describe("when the current user is one of the selected participants", () => {
    it("should not include the current user's id in the sendKey call", () => {
      mockUseOpenLockedBoxStore.mockImplementation((selector) =>
        selector({
          state: "ready-to-unlock",
          shareAccessKeyByKeyHolderId: {
            user1: true,
            user2: true,
            user3: false,
          },
          you: { id: "user1", name: "User 1", userAgent: "Agent 1" },
        }),
      );

      renderUseShareKeyWithParticipants();

      expect(mockSendKey).toHaveBeenCalledTimes(1);
      expect(mockSendKey).toHaveBeenCalledWith(["user2"]);
    });
  });
});
