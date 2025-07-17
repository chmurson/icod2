import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { ParticipantType } from "./common-types";

const joinBoxDefaultState = {
  state: "initial" as
    | "initial"
    | "set-name"
    | "connecting"
    | "connected"
    | "created",
  title: "",
  connecting: false,
  connected: false,
  created: false,
  error: null as string | null,
  you: {
    id: "",
    name: "",
    userAgent: "",
  } satisfies ParticipantType,
  leader: {
    id: "",
    name: "",
    userAgent: "",
  } satisfies ParticipantType,
  otherKeyHolders: [] as ParticipantType[],
  content: "",
  threshold: 1,
  encryptedMessage: "",
  generatedKey: "",
};

export type JoinBoxStateData = typeof joinBoxDefaultState;

type JoinBoxState = {
  actions: {
    reset: () => void;
    start: () => void;
    connect: (args: { name: string; userAgent: string }) => void;
    connectYou: (args: {
      you: { id: string };
      leader: ParticipantType;
    }) => void;
    connectParticipant: (participant: ParticipantType) => void;
    disconnectParticipant: (participantId: string) => void;
    create: (message: {
      title?: string;
      content?: string;
      encryptedMessage?: string;
      generatedKey?: string;
    }) => void;
    setInfoBox: (arg: {
      threshold: number;
      content: string;
      title: string;
    }) => void;
  };
} & JoinBoxStateData;

export const useJoinBoxStore = create<JoinBoxState>()(
  devtools((set) => ({
    ...joinBoxDefaultState,
    actions: {
      start: () => set({ ...joinBoxDefaultState, state: "set-name" }),
      connect: ({ name, userAgent }) =>
        set((state) => ({
          ...joinBoxDefaultState,
          connecting: true,
          state: "connecting",
          you: {
            ...state.you,
            name,
            userAgent,
          },
        })),
      connectYou: ({
        you,
        leader,
      }: {
        you: { id: string };
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
      connectParticipant: (participant: ParticipantType) => {
        set((state) => ({
          otherKeyHolders: [
            ...state.otherKeyHolders,
            {
              ...participant,
            },
          ],
        }));
      },
      disconnectParticipant: (participantId: string) => {
        set((state) => ({
          otherKeyHolders: state.otherKeyHolders.filter(
            (participant) => participant.id !== participantId,
          ),
        }));
      },
      create: (message) =>
        set({
          ...message,
          created: true,
          state: "created",
        }),
      reset: () =>
        set({
          ...joinBoxDefaultState,
        }),
      setInfoBox: (newPartState) => set(newPartState),
    },
  })),
);
