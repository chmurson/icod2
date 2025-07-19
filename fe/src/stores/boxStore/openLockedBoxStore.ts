import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { ParticipantType } from "./common-types";

const openLockedBoxState = {
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

export const useOpenLockedBoxStore = create<OpenLockedBoxState>()(
  devtools((set) => ({
    ...openLockedBoxState,
    actions: {
      start: () => set({ ...openLockedBoxState, state: "drop-box" }),
      toggleShareAccessKey: (keyHolderId: string, value?: boolean) =>
        set((state) => ({
          shareAccessKeyByKeyHolderId: {
            ...state.shareAccessKeyByKeyHolderId,
            [keyHolderId]:
              value ?? !state.shareAccessKeyByKeyHolderId[keyHolderId],
          },
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
          ...openLockedBoxState,
        }),
    },
  })),
);
