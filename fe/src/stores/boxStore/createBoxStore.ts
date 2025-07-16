import { create } from "zustand";
import { leaderService } from "@/services/web-rtc/leaderSingleton";
import type { ParticipantType } from "./common-types";

const createBoxDefaultState = {
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
  leader: {
    id: "",
    name: "",
    userAgent: "",
  } satisfies ParticipantType,
  keyholders: [] as ParticipantType[],
  content: "",
  threshold: 1,
  encryptedMessage: "",
  generatedKeys: [] as string[],
  generatedKey: "",
};

export type CreateBoxStateData = typeof createBoxDefaultState;

type CreateBoxState = {
  actions: {
    reset: () => void;
    connectLeader: (leader: { id: string }) => void;
    connectParticipant: (participant: ParticipantType) => void;
    disconnectParticipant: (participantId: string) => void;
    start: () => void;
    connect: (args: { name: string; userAgent: string }) => void;
    create: (message: {
      title?: string;
      content?: string;
      encryptedMessage?: string;
      generatedKeys?: string[];
      generatedKey?: string;
    }) => void;
    setBoxInfo: (
      args: Pick<CreateBoxStateData, "title" | "content" | "threshold">,
    ) => void;
  };
} & CreateBoxStateData;

export const useCreateBoxStore = create<CreateBoxState>((set) => ({
  ...createBoxDefaultState,
  actions: {
    connect: ({ name, userAgent }) =>
      set({
        ...createBoxDefaultState,
        connecting: true,
        state: "connecting",
        leader: { id: "", name, userAgent },
      }),
    start: () => set({ ...createBoxDefaultState, state: "set-name" }),
    connectLeader: (leader) =>
      set((state) => ({
        leader: {
          ...state.leader,
          id: leader.id,
        },
        connecting: false,
        connected: true,
        error: null,
        state: "connected",
      })),
    connectParticipant: (participant) =>
      set((state) => ({
        keyholders: [
          ...state.keyholders,
          {
            ...participant,
          },
        ],
      })),
    disconnectParticipant: (participantId: string) => {
      set((state) => ({
        keyholders: state.keyholders.filter(
          (participant) => participant.id !== participantId,
        ),
      }));
    },
    create: (message) => {
      set({
        ...message,
        created: true,
        state: "created",
      });
      const { generatedKeys, ...messageToSend } = message;
      leaderService.createBox({ type: "createBox", ...messageToSend });
    },
    reset: () =>
      set({
        ...createBoxDefaultState,
      }),
    setBoxInfo: ({
      content,
      title,
      threshold,
    }: Pick<CreateBoxStateData, "title" | "content" | "threshold">) =>
      set({
        content,
        title,
        threshold,
      }),
  },
}));
