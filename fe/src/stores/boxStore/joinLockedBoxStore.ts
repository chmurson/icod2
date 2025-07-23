import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { ParticipantType } from "./common-types";

const joinLockedBoxState = {
  state: "initial" as
    | "initial"
    | "drop-box"
    | "connecting"
    | "connected"
    | "opened",
  connecting: false,
  connected: false,
  created: false,
  error: null as string | null,
  boxTitle: "",
  encryptedMessage: "",
  key: "",
  keyHolderId: "",
  connectedLeaderId: undefined as string | undefined,
  onlineKeyHolders: [] as ParticipantType[],
  offLineKeyHolders: [] as ParticipantType[],
  keyThreshold: 1,
  you: {
    id: "",
    name: "",
    userAgent: "",
  } satisfies ParticipantType,
  decryptedContent: "",
  shareAccessKeyByKeyHolderId: {} as Record<string, boolean>,
  unlockingStartDate: null as Date | null,
};

export type JoinLockedBoxStateData = typeof joinLockedBoxState;

type JoinLockedBoxState = {
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
    connectKeyHolder: (
      participant: ParticipantType & { isLeader?: boolean },
    ) => void;
    disconnectKeyHolder: (participant: ParticipantType) => void;
    open: (message: {
      title?: string;
      content?: string;
      encryptedMessage?: string;
      generatedKey?: string;
    }) => void;
    setError: (error: string) => void;
    setUnlockingStartDate: (unlockingStartDate: Date) => void;
  };
} & JoinLockedBoxStateData;

export const useJoinLockedBoxStore = create<JoinLockedBoxState>()(
  devtools((set) => ({
    ...joinLockedBoxState,
    actions: {
      start: () => set({ ...joinLockedBoxState, state: "drop-box" }),
      toggleShareAccessKey: (keyHolderId: string, value?: boolean) =>
        set((state) => ({
          shareAccessKeyByKeyHolderId: {
            ...state.shareAccessKeyByKeyHolderId,
            [keyHolderId]:
              value ?? !state.shareAccessKeyByKeyHolderId[keyHolderId],
          },
        })),
      toggleSharesAccessKeys: (idsOfKeyHoldersToShareWith: string[]) =>
        set(() => ({
          shareAccessKeyByKeyHolderId: Object.fromEntries(
            idsOfKeyHoldersToShareWith.map((id) => [id, true]),
          ),
        })),
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
      connectKeyHolder: (
        keyHolder: ParticipantType & { isLeader?: boolean },
      ) => {
        set((state) => {
          const { isLeader, ...keyHolderObject } = keyHolder;

          const onlineKeyHolders = [
            ...state.onlineKeyHolders.filter(
              (kh) => kh.id !== keyHolderObject.id,
            ),
            {
              ...keyHolderObject,
            },
          ];

          const offLineKeyHolders = state.offLineKeyHolders.filter(
            (x) => x.id !== keyHolder.id,
          );

          if (isLeader) {
            const connectedLeaderId = keyHolderObject.id;

            return {
              connectedLeaderId,
              onlineKeyHolders,
              offLineKeyHolders,
            };
          }

          return {
            onlineKeyHolders,
            offLineKeyHolders,
          };
        });
      },
      disconnectKeyHolder: (keyHolder: ParticipantType) => {
        set((state) => {
          const offLineKeyHolders = [
            ...state.offLineKeyHolders,
            {
              ...keyHolder,
            },
          ];

          const onlineKeyHolders = state.onlineKeyHolders.filter(
            (x) => x.id !== keyHolder.id,
          );

          if (keyHolder.id === state.connectedLeaderId) {
            return {
              connectedLeaderId: undefined,
              offLineKeyHolders,
              onlineKeyHolders,
            };
          }
          return {
            offLineKeyHolders,
            onlineKeyHolders,
          };
        });
      },
      open: (message) =>
        set({
          ...message,
          created: true,
          state: "opened",
        }),
      reset: () =>
        set({
          ...joinLockedBoxState,
        }),
      setError: (error: string) => set({ error }),
      setUnlockingStartDate: (unlockingStartDate: Date) =>
        set({ unlockingStartDate }),
    },
  })),
);
if (import.meta.env.DEV === true) {
  //@ts-ignore
  window.useJoinLockedBoxStore = {
    connectAllOffLineKeyholders: () => {
      const {
        offLineKeyHolders,
        actions: { connectKeyHolder },
      } = useJoinLockedBoxStore.getState();

      offLineKeyHolders.forEach(connectKeyHolder);
    },
  };
}
