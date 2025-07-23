import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { areArraysOfPrimitiveEqual } from "@/utils/areArraysOfPrimitiveEqual";
import { hasSameTrueKeys } from "@/utils/hasSameTrueKeys";
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
  shareAccessKeyMapByKeyHolderId: {} as Record<string, Record<string, boolean>>,
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
    open: (message: {
      title?: string;
      content?: string;
      encryptedMessage?: string;
      generatedKey?: string;
    }) => void;
    setError: (error: string) => void;
    setPartialStateUpdate: (
      payload: Partial<
        Pick<
          JoinLockedBoxStateData,
          "shareAccessKeyMapByKeyHolderId" | "onlineKeyHolders"
        >
      >,
    ) => void;
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
      setPartialStateUpdate: (
        payload: Partial<
          Pick<
            JoinLockedBoxStateData,
            | "shareAccessKeyMapByKeyHolderId"
            | "onlineKeyHolders"
            | "offLineKeyHolders"
          >
        >,
      ) =>
        set((state) => {
          const filteredPayload: typeof payload = {};

          if (
            !hasSameTrueKeys(
              state.shareAccessKeyMapByKeyHolderId,
              payload.shareAccessKeyMapByKeyHolderId ?? {},
            )
          ) {
            filteredPayload.shareAccessKeyMapByKeyHolderId =
              payload.shareAccessKeyMapByKeyHolderId ?? {};
          }

          const newOnlineKeyHolders = (payload.onlineKeyHolders ?? []).filter(
            (kh) => kh.id !== state.you.id,
          );

          if (
            payload.onlineKeyHolders &&
            !areArraysOfPrimitiveEqual(
              state.onlineKeyHolders,
              newOnlineKeyHolders,
            )
          ) {
            const newOffLineKeyHolders = [
              ...state.onlineKeyHolders,
              ...state.offLineKeyHolders,
            ].filter(
              (kh) =>
                kh.id !== state.you.id &&
                !newOnlineKeyHolders.some(
                  (newOnlineKh) => kh.id !== newOnlineKh.id,
                ),
            );

            filteredPayload.onlineKeyHolders = newOnlineKeyHolders;
            filteredPayload.offLineKeyHolders = newOffLineKeyHolders;
          }

          return filteredPayload;
        }),
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
