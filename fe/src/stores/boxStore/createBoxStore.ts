import { create, type StateCreator } from "zustand";
import { devtools } from "zustand/middleware";
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
  roomToken: "",
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
  isPristine: true as boolean,
};

export type CreateBoxStateData = typeof createBoxDefaultState;

type CreateBoxState = {
  actions: {
    reset: () => void;
    connectParticipant: (participant: ParticipantType) => void;
    disconnectParticipant: (participantId: string) => void;
    start: () => void;
    connect: (args: {
      name: string;
      userAgent: string;
      roomToken: string;
    }) => void;
    setLeaderPeerId: (peerId: string) => void;
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

const createStoreFn: StateCreator<CreateBoxState> = (set, get) => ({
  ...createBoxDefaultState,
  actions: {
    connect: ({ name, userAgent, roomToken }) =>
      set({
        ...createBoxDefaultState,
        connecting: true,
        state: "connecting",
        leader: {
          id: "",
          name,
          userAgent,
        },
        roomToken,
      }),
    setLeaderPeerId: (peerId: string) =>
      set({
        ...get(),
        leader: {
          ...get().leader,
          id: peerId,
        },
      }),
    start: () => set({ ...createBoxDefaultState, state: "set-name" }),
    connectParticipant: (participant) =>
      set((state) => ({
        keyHolders: [
          ...state.keyHolders,
          {
            ...participant,
          },
        ],
        isPristine: false,
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
    ) => set({ ...payload, isPristine: false }),

    setContentPreviewSharedWith: (keyHolderId: string, value: boolean) =>
      set({
        contentPreviewSharedWith: {
          ...get().contentPreviewSharedWith,
          [keyHolderId]: value,
        },
      }),
  },
});

export const useCreateBoxStore = create<CreateBoxState>()(
  devtools(createStoreFn, {
    name: "createBoxStore",
  }),
);
