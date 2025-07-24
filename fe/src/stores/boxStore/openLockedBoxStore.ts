import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { ParticipantType } from "./common-types";

type KeyHolderId = string;

const openLockedBoxState = {
  state: "initial" as
    | "initial"
    | "drop-box"
    | "connecting"
    | "connected"
    | "unlocked",
  connecting: false,
  connected: false,
  error: null as string | null,
  boxTitle: "",
  encryptedMessage: "",
  key: "",
  keyHolderId: "",
  onlineKeyHolders: [] as ParticipantType[],
  offLineKeyHolders: [] as ParticipantType[],
  keyThreshold: 1,
  you: {
    id: "",
    name: "",
    userAgent: "",
  } satisfies ParticipantType,
  decryptedContent: "",
  receivedKeysByKeyHolderId: undefined as Record<string, string> | undefined,
  shareAccessKeyByKeyHolderId: {} as Record<string, boolean>,
  shareAccessKeyMapByKeyholderId: {} as Record<
    KeyHolderId,
    Record<KeyHolderId, boolean>
  >,
  unlockingStartDate: null as Date | null,
};

export type OpenLockedBoxStateData = typeof openLockedBoxState;

type OpenLockedBoxState = {
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
    }) => void;
    toggleShareAccessKey: (participantId: string, value?: boolean) => void;
    toggleSharesAccessKeys: (idsOfKeyHoldersToShareWith: string[]) => void;
    setShareAccessKeyByKeyholderId: (
      keyHolderId: string,
      shareAccessKeyMapByKeyholderId: Record<KeyHolderId, boolean>,
    ) => void;
    connectKeyHolder: (participant: ParticipantType) => void;
    disconnectKeyHolder: (participantId: string) => void;
    unlock: (message: { keysByKeyHolderId?: Record<string, string> }) => void;
    setUnlockingStartDate: (unlockingStartDate: Date | null) => void;
  };
} & OpenLockedBoxStateData;

export const useOpenLockedBoxStore = create<OpenLockedBoxState>()(
  devtools((set) => ({
    ...openLockedBoxState,
    actions: {
      start: () => set({ ...openLockedBoxState, state: "drop-box" }),
      toggleShareAccessKey: (keyHolderId: string, value?: boolean) =>
        set((state) => {
          const shareAccessKeyByKeyHolderId = {
            ...state.shareAccessKeyByKeyHolderId,
            [keyHolderId]:
              value ?? !state.shareAccessKeyByKeyHolderId[keyHolderId],
          };

          return {
            shareAccessKeyByKeyHolderId,
            shareAccessKeyMapByKeyholderId: {
              ...state.shareAccessKeyMapByKeyholderId,
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
            shareAccessKeyByKeyHolderId,
            shareAccessKeyMapByKeyholderId: {
              ...state.shareAccessKeyMapByKeyholderId,
              [state.you.id]: shareAccessKeyByKeyHolderId,
            },
          };
        }),
      setShareAccessKeyByKeyholderId: (
        keyholderId: string,
        shareAccessKeyMapByKeyholderId: Record<KeyHolderId, boolean>,
      ) => {
        set((state) => ({
          shareAccessKeyMapByKeyholderId: {
            ...state.shareAccessKeyMapByKeyholderId,
            [keyholderId]: shareAccessKeyMapByKeyholderId,
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
      unlock: (message) =>
        set({
          receivedKeysByKeyHolderId: message.keysByKeyHolderId,
          state: "unlocked",
        }),
      reset: () =>
        set({
          ...openLockedBoxState,
        }),
      setUnlockingStartDate: (unlockingStartDate: Date | null) =>
        set({ unlockingStartDate }),
    } satisfies OpenLockedBoxState["actions"],
  })),
);

if (import.meta.env.DEV === true) {
  //@ts-ignore
  window.useOpenLockedBoxStore = {
    connectAllOffLineKeyholders: () => {
      const {
        offLineKeyHolders,
        actions: { connectKeyHolder },
      } = useOpenLockedBoxStore.getState();

      offLineKeyHolders.forEach(connectKeyHolder);
    },
  };
}
