import { create } from "zustand";
import { devtools } from "zustand/middleware";
import {
  type LockedBoxStoreCommonPart,
  lockedBoxStoreStateCommonPart,
  type ParticipantType,
} from "./common-types";

type KeyHolderId = string;

const openLockedBoxState = {
  ...lockedBoxStoreStateCommonPart,
  connecting: false,
  connected: false,
  error: null as string | null,
  boxTitle: "",
  keyHolderId: "",
  decryptedContent: "",
  receivedKeysByKeyHolderId: undefined as Record<string, string> | undefined,
  shareAccessKeyByKeyHolderId: {} as Record<string, boolean>,
};

export type OpenLockedBoxStateData = typeof openLockedBoxState;

export type OpenLockedBoxState = {
  actions: {
    reset: () => void;
    start: () => void;
    connect: (args: {
      boxTitle: string;
      encryptedMessage: string;
      key: string;
      keyHolderId: string;
      keyHolders: ParticipantType[];
      keyThreshold: number;
      roomToken: string;
    }) => void;
    toggleShareAccessKey: (participantId: string, value?: boolean) => void;
    toggleSharesAccessKeys: (idsOfKeyHoldersToShareWith: string[]) => void;
    setShareAccessKeyByKeyholderId: (
      keyHolderId: string,
      shareAccessKeyMapByKeyHolderId: Record<KeyHolderId, boolean>,
    ) => void;
    connectKeyHolder: (participant: ParticipantType) => void;
    disconnectKeyHolder: (participantId: string) => void;
    addReceivedKey: (message: { fromKeyHolderId: string; key: string }) => void;
    setUnlockingStartDate: (unlockingStartDate: Date | null) => void;
    hasEnoughKeysToUnlock: () => boolean;
    markAsConnected: () => void;
    markAsDisconnected: () => void;
  } & LockedBoxStoreCommonPart["actions"];
} & OpenLockedBoxStateData;

export const useOpenLockedBoxStore = create<OpenLockedBoxState>()(
  devtools((set, get) => ({
    ...openLockedBoxState,
    actions: {
      start: () => set({ ...openLockedBoxState, state: "drop-box" }),
      setReadyToUnlock: () => set({ state: "ready-to-unlock" }),
      toggleShareAccessKey: (keyHolderId: string, value?: boolean) =>
        set((state) => {
          const shareAccessKeyByKeyHolderId = {
            ...state.shareAccessKeyByKeyHolderId,
            [keyHolderId]:
              value ?? !state.shareAccessKeyByKeyHolderId[keyHolderId],
          };

          return {
            isPristine: false,
            shareAccessKeyByKeyHolderId,
            shareAccessKeyMapByKeyHolderId: {
              ...state.shareAccessKeyMapByKeyHolderId,
              [state.you.id]: shareAccessKeyByKeyHolderId,
            },
          };
        }),
      toggleSharesAccessKeys: (idsOfKeyHoldersToShareWith: string[]) =>
        set((state) => {
          const shareAccessKeyByKeyHolderId = Object.fromEntries(
            idsOfKeyHoldersToShareWith.map((id) => [id, true]),
          );

          return {
            isPristine: false,
            shareAccessKeyByKeyHolderId,
            shareAccessKeyMapByKeyHolderId: {
              ...state.shareAccessKeyMapByKeyHolderId,
              [state.you.id]: shareAccessKeyByKeyHolderId,
            },
          };
        }),
      setShareAccessKeyByKeyholderId: (
        keyholderId: string,
        shareAccessKeyMapByKeyHolderId: Record<KeyHolderId, boolean>,
      ) => {
        set((state) => ({
          isPristine: false,
          shareAccessKeyMapByKeyHolderId: {
            ...state.shareAccessKeyMapByKeyHolderId,
            [keyholderId]: shareAccessKeyMapByKeyHolderId,
          },
        }));
      },
      connect: ({
        boxTitle,
        encryptedMessage,
        key,
        keyHolderId,
        keyHolders,
        keyThreshold,
        roomToken,
      }) => {
        const you = keyHolders.find((x) => x.id === keyHolderId);
        if (!you)
          throw new Error("Cannot find current key holder in keyHolders");
        set({
          connecting: true,
          state: "connecting",
          boxTitle,
          encryptedMessage,
          key,
          keyHolderId,
          offLineKeyHolders: keyHolders
            .filter((x) => x.id !== keyHolderId)
            .map((x) => {
              return {
                ...x,
                isOnline: false,
              };
            }),
          keyThreshold,
          you: {
            ...you,
          },
          roomToken,
        });
      },
      connectKeyHolder: (keyHolder: ParticipantType) => {
        set((state) => ({
          onlineKeyHolders: [
            ...state.onlineKeyHolders,
            {
              ...keyHolder,
            },
          ],
          isPristine: false,
          offLineKeyHolders: state.offLineKeyHolders.filter(
            (x) => x.id !== keyHolder.id,
          ),
        }));
      },
      disconnectKeyHolder: (disconnectedKeyHolderId: string) => {
        set((state) => {
          const disconnectedKeyHolder = state.onlineKeyHolders.find(
            (kh) => kh.id === disconnectedKeyHolderId,
          );

          if (!disconnectedKeyHolder) {
            return {};
          }

          return {
            onlineKeyHolders: state.onlineKeyHolders.filter(
              (kh) => kh.id !== disconnectedKeyHolderId,
            ),
            offLineKeyHolders: [
              disconnectedKeyHolder,
              ...state.offLineKeyHolders,
            ],
          };
        });
      },
      addReceivedKey: ({ fromKeyHolderId, key }) =>
        set({
          receivedKeysByKeyHolderId: {
            ...get().receivedKeysByKeyHolderId,
            [fromKeyHolderId]: key,
          },
        }),
      reset: () =>
        set({
          ...openLockedBoxState,
        }),
      markAsConnected: () =>
        set({
          state: "connected",
          connected: true,
          connecting: false,
        }),
      markAsDisconnected: () =>
        set({
          state: "disconnected",
          connected: false,
          connecting: false,
        }),
      setUnlockingStartDate: (unlockingStartDate: Date | null) =>
        set({ unlockingStartDate }),
      hasEnoughKeysToUnlock: () => {
        const { receivedKeysByKeyHolderId, keyThreshold, key } = get();

        const receivedKeysNumber = Object.keys(
          receivedKeysByKeyHolderId ?? {},
        ).length;
        const hasKeyHimself = !!key?.trim();

        return receivedKeysNumber + (hasKeyHimself ? 1 : 0) >= keyThreshold;
      },
    } satisfies OpenLockedBoxState["actions"],
  })),
);

if (import.meta.env.DEV === true) {
  //@ts-expect-error
  window.useOpenLockedBoxStore = {
    connectAllOffLineKeyholders: () => {
      const {
        offLineKeyHolders,
        actions: { connectKeyHolder },
      } = useOpenLockedBoxStore.getState();

      offLineKeyHolders.forEach(connectKeyHolder);
    },
    setReadyToUnlock: () => {
      useOpenLockedBoxStore.getState().actions.setReadyToUnlock();
    },
    addReceivedKey: (arg: { fromKeyHolderId: string; key: string }) => {
      useOpenLockedBoxStore.getState().actions.addReceivedKey(arg);
      useOpenLockedBoxStore.getState().actions.setReadyToUnlock();
    },
  };
}
