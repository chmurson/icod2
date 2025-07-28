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
  sessionId: "" as string,
  otherKeyHolders: [] as ParticipantType[],
  content: undefined as string | undefined,
  threshold: 1,
  encryptedMessage: "",
  generatedKey: "",
  connectionToLeaderFailReason: undefined as
    | "not-authorized"
    | "timeout"
    | "other"
    | undefined,
};

export type JoinBoxStateData = typeof joinBoxDefaultState;

type JoinBoxState = {
  actions: {
    reset: () => void;
    start: () => void;
    connect: (args: {
      name: string;
      userAgent: string;
      sessionId: string;
    }) => void;
    connectYou: (args: {
      you: { id: string };
      leader: ParticipantType;
    }) => void;
    cannotConnectLeader: (
      reason: JoinBoxStateData["connectionToLeaderFailReason"],
    ) => void;
    updateKeyHoldersList: (participant: ParticipantType[]) => void;
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
      content?: string;
      title: string;
    }) => void;
  };
} & JoinBoxStateData;

export const useJoinBoxStore = create<JoinBoxState>()(
  devtools((set) => ({
    ...joinBoxDefaultState,
    actions: {
      start: () => set({ ...joinBoxDefaultState, state: "set-name" }),
      connect: ({ name, userAgent, sessionId }) =>
        set((state) => ({
          ...joinBoxDefaultState,
          connecting: true,
          state: "connecting",
          sessionId,
          you: {
            ...state.you,
            name,
            userAgent,
          },
        })),
      cannotConnectLeader: (
        reason: JoinBoxStateData["connectionToLeaderFailReason"],
      ) =>
        set({
          connectionToLeaderFailReason: reason,
        }),
      updateKeyHoldersList: (keyHolderList: ParticipantType[]) => {
        set((state) => ({
          otherKeyHolders: keyHolderList.filter(
            (keyHolder) => keyHolder.id !== state.you.id,
          ),
        }));
      },
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
    } satisfies JoinBoxState["actions"],
  })),
);
