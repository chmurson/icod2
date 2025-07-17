import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { KeyHolderType, ParticipantType } from "./common-types";

const openLockedBoxCreationState = {
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
  onlineKeyHolders: [] as KeyHolderType[],
  offLineKeyHolders: [] as KeyHolderType[],
  keyThreshold: 1,
  you: {
    id: "",
    name: "",
    userAgent: "",
  } satisfies ParticipantType,
  decryptedContent: "",
};

export type OpenLockedBoxStateData = typeof openLockedBoxCreationState;

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
    connectKeyHolder: (participant: ParticipantType) => void;
    disconnectKeyHolder: (participantId: string) => void;
    open: (message: {
      title?: string;
      content?: string;
      encryptedMessage?: string;
      generatedKey?: string;
    }) => void;
  };
} & OpenLockedBoxStateData;

export const useOpenLockedBoxCreationStore = create<OpenLockedBoxState>()(
  devtools((set) => ({
    ...openLockedBoxCreationState,
    actions: {
      start: () => set({ ...openLockedBoxCreationState, state: "drop-box" }),
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
      connectYou: ({
        you,
        leader,
      }: {
        you: ParticipantType;
        leader: ParticipantType;
      }) =>
        set((state) => ({
          leader,
          you: {
            ...state.you,
            id: you.id,
          },
          connecting: false,
          connected: true,
          error: null,

          state: "connected",
        })),
      connectKeyHolder: (keyHolder: ParticipantType) => {
        set((state) => ({
          onlineKeyHolders: [
            ...state.onlineKeyHolders,
            {
              ...keyHolder,
              isOnline: true,
            },
          ],
          offLineKeyHolders: state.offLineKeyHolders.filter(
            (x) => x.id !== keyHolder.id,
          ),
        }));
      },
      disconnectKeyHolder: (keyHolder: ParticipantType) => {
        set((state) => ({
          offLineKeyHolders: [
            ...state.offLineKeyHolders,
            {
              ...keyHolder,
              isOnline: true,
            },
          ],
          onlineKeyHolders: state.onlineKeyHolders.filter(
            (x) => x.id !== keyHolder.id,
          ),
        }));
      },
      open: (message) =>
        set({
          ...message,
          created: true,
          state: "opened",
        }),
      reset: () =>
        set({
          ...openLockedBoxCreationState,
        }),
    },
  })),
);
