import { create } from "zustand";
import type { ParticipantType } from "./common-types";

const createBoxDefaultState = {
  state: "initial" as
    | "initial"
    | "set-name"
    | "connecting"
    | "connected"
    | "creating"
    | "created",
  title: "",
  connecting: false,
  connected: false,
  error: null as string | null,
  leader: {
    id: "",
    name: "",
    userAgent: "",
  } satisfies ParticipantType,
  keyHolders: [] as ParticipantType[],
  content: "",
  threshold: 1,
  encryptedMessage: "",
  generatedKeys: [] as string[],
  generatedKey: "",
  contentPreviewSharedWith: {} as Record<string, boolean>,
};

export type CreateBoxStateData = typeof createBoxDefaultState;

type CreateBoxState = {
  actions: {
    reset: () => void;
    connectLeader: (leader: { id: string }) => void;
    connectParticipant: (participant: ParticipantType) => void;
    disconnectParticipant: (participantId: string) => void;
    start: () => void;
    connect: (args: {
      name: string;
      userAgent: string;
      idToken?: string;
    }) => void;
    markAsLocked: () => void;
    markAsLocking: () => void;
    setBoxInfo: (
      args: Partial<
        Pick<CreateBoxStateData, "title" | "content" | "threshold">
      >,
    ) => void;
    setContentPreviewSharedWith: (keyHolderId: string, value: boolean) => void;
  };
} & CreateBoxStateData;

export const useCreateBoxStore = create<CreateBoxState>((set, get) => ({
  ...createBoxDefaultState,
  actions: {
    connect: ({ name, userAgent, idToken }) =>
      set({
        ...createBoxDefaultState,
        connecting: true,
        state: "connecting",
        leader: {
          id: idToken ?? "",
          name,
          userAgent,
        },
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
        keyHolders: [
          ...state.keyHolders,
          {
            ...participant,
          },
        ],
      })),
    disconnectParticipant: (participantId: string) => {
      set((state) => ({
        keyHolders: state.keyHolders.filter(
          (participant) => participant.id !== participantId,
        ),
      }));
    },
    markAsLocked: () =>
      set({
        state: "created",
      }),
    markAsLocking: () =>
      set({
        state: "creating",
      }),
    reset: () =>
      set({
        ...createBoxDefaultState,
      }),
    setBoxInfo: (
      payload: Partial<
        Pick<CreateBoxStateData, "title" | "content" | "threshold">
      >,
    ) => set(payload),

    setContentPreviewSharedWith: (keyHolderId: string, value: boolean) =>
      set({
        contentPreviewSharedWith: {
          ...get().contentPreviewSharedWith,
          [keyHolderId]: value,
        },
      }),
  },
}));
