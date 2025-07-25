import { renderHook } from "@testing-library/react";
import type { StoreApi, UseBoundStore } from "zustand";
import {
  type JoinLockedBoxState,
  useJoinLockedBoxStore,
} from "@/stores/boxStore/joinLockedBoxStore";
import { useSendKeyToLeader } from "./useSendKeyToLeader";

vi.mock("@/stores/boxStore/joinLockedBoxStore", () => ({
  useJoinLockedBoxStore: vi.fn(),
}));

const mockUseJoinLockedBoxStore = vi.mocked(
  useJoinLockedBoxStore as unknown as UseBoundStore<
    StoreApi<Pick<JoinLockedBoxState, "shareAccessKeyByKeyHolderId" | "state">>
  >,
);

describe("useSendKeyToLeader", () => {
  const mockSendKey = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const renderUseSendKeyToLeader = () => {
    return renderHook(() => useSendKeyToLeader(mockSendKey));
  };

  describe("when state is ready-to-unlock and some participants are selected", () => {
    it("should call sendKey", () => {
      mockUseJoinLockedBoxStore.mockImplementation((selector) =>
        selector({
          state: "ready-to-unlock",
          shareAccessKeyByKeyHolderId: {
            user1: true,
            user2: false,
            user3: true,
          },
        }),
      );

      renderUseSendKeyToLeader();

      expect(mockSendKey).toHaveBeenCalledTimes(1);
    });
  });

  describe("when state is not ready-to-unlock and no participants are selected", () => {
    it("should not call sendKey", () => {
      mockUseJoinLockedBoxStore.mockImplementation((selector) =>
        selector({
          state: "connected",
          shareAccessKeyByKeyHolderId: {
            user1: false,
            user2: false,
          },
        }),
      );

      renderUseSendKeyToLeader();

      expect(mockSendKey).not.toHaveBeenCalled();
    });
  });

  describe("when state is ready-to-unlock but no participants are selected", () => {
    it("should not call sendKey", () => {
      mockUseJoinLockedBoxStore.mockImplementation((selector) =>
        selector({
          state: "ready-to-unlock",
          shareAccessKeyByKeyHolderId: {
            user1: false,
            user2: false,
          },
        }),
      );

      renderUseSendKeyToLeader();

      expect(mockSendKey).not.toHaveBeenCalled();
    });
  });

  describe("when state is not ready-to-unlock but some participants are selected", () => {
    it("should not call sendKey", () => {
      mockUseJoinLockedBoxStore.mockImplementation((selector) =>
        selector({
          state: "connected",
          shareAccessKeyByKeyHolderId: {
            user1: true,
            user2: true,
          },
        }),
      );

      renderUseSendKeyToLeader();

      expect(mockSendKey).not.toHaveBeenCalled();
    });
  });
});
