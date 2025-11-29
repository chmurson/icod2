import { isEqual, startOfSecond } from "date-fns";
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { areArraysOfPrimitiveEqual } from "@/utils/areArraysOfPrimitiveEqual";
import { hasSameTrueKeys } from "@/utils/hasSameTrueKeys";
import { safeParseAndCheckRecent } from "@/utils/safeDateParseAndCheckRecent";
import {
  type LockedBoxStoreCommonPart,
  lockedBoxStoreStateCommonPart,
  type ParticipantType,
} from "./common-types";
import {
  type DataRequiredToCalculateMetaStatus,
  getLockedBoxTopLobbyMetaStatus,
} from "./commons/getLockedBoxTopLobbyMetaStatus";

const joinLockedBoxState = {
  ...lockedBoxStoreStateCommonPart,
  connecting: false,
  connected: false,
  error: null as string | null,
  boxTitle: "",
  connectedLeaderId: undefined as string | undefined,
  keyHolderId: "",
  you: {
    id: "",
    name: "",
    userAgent: "",
  } satisfies ParticipantType,
  decryptedContent: "",
  shareAccessKeyByKeyHolderId: {} as Record<string, boolean>,
  connectionToLeaderFailReason: undefined as
    | "not-authorized"
    | "peer-connection-failed"
    | "timeout"
    | "other"
    | undefined,
};

export type JoinLockedBoxStateData = typeof joinLockedBoxState & {
  getTopLobbyMetaStatus: () => ReturnType<
    typeof getLockedBoxTopLobbyMetaStatus
  >;
};

type SetPartialStateUpdate = (
  payload: Partial<
    Pick<
      JoinLockedBoxStateData,
      | "shareAccessKeyMapByKeyHolderId"
      | "onlineKeyHolders"
      | "offLineKeyHolders"
    > & { unlockingStartDate?: string | null }
  >,
) => void;

export type JoinLockedBoxState = {
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
      roomToken: string;
    }) => void;
    toggleShareAccessKey: (participantId: string, value?: boolean) => void;
    toggleSharesAccessKeys: (idsOfKeyHoldersToShareWith: string[]) => void;
    connectKeyHolder: (
      participant: ParticipantType & { isLeader?: boolean },
    ) => void;
    addReceivedKey: (message: { fromKeyHolderId: string; key: string }) => void;
    setError: (error: string) => void;
    setUnlockingStartDate: (unlockingStartDate: Date | null) => void;
    setPartialStateUpdate: SetPartialStateUpdate;
    reactToDisconnectedLeader: () => void;
    cannotConnectLeader: (
      reason: JoinLockedBoxStateData["connectionToLeaderFailReason"],
    ) => void;
  } & LockedBoxStoreCommonPart["actions"];
} & JoinLockedBoxStateData;

export const useJoinLockedBoxStore = create<JoinLockedBoxState>()(
  devtools((set, get) => ({
    ...joinLockedBoxState,
    getTopLobbyMetaStatus: () =>
      getLockedBoxTopLobbyMetaStatus(
        getDataRequiredToCalculateMetaStatus(get()),
      ),
    actions: {
      start: () => set({ ...joinLockedBoxState, state: "drop-box" }),
      setReadyToUnlock: () => set({ state: "ready-to-unlock" }),
      toggleShareAccessKey: (keyHolderId: string, value?: boolean) =>
        set((state) => ({
          isPristine: false,
          shareAccessKeyByKeyHolderId: {
            ...state.shareAccessKeyByKeyHolderId,
            [keyHolderId]:
              value ?? !state.shareAccessKeyByKeyHolderId[keyHolderId],
          },
        })),
      toggleSharesAccessKeys: (idsOfKeyHoldersToShareWith: string[]) =>
        set(() => ({
          isPristine: false,
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
        roomToken,
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
          roomToken,
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
              connected: true,
              connecting: false,
              state: "connected",
              connectedLeaderId,
              onlineKeyHolders,
              offLineKeyHolders,
              isPristine: false,
            };
          }

          return {
            onlineKeyHolders,
            offLineKeyHolders,
            isPristine: false,
          };
        });
      },
      addReceivedKey: ({ fromKeyHolderId, key }) =>
        set({
          receivedKeysByKeyHolderId: {
            ...get().receivedKeysByKeyHolderId,
            [fromKeyHolderId]: key,
          },
        }),
      reset: () =>
        set({
          ...joinLockedBoxState,
        }),
      setError: (error: string) => set({ error }),
      setUnlockingStartDate: (unlockingStartDate: Date) =>
        set({ unlockingStartDate }),

      reactToDisconnectedLeader: () =>
        set((state) => {
          const newState = {
            ...state,
            onlineKeyHolders: [],
            offLineKeyHolders: [
              ...state.onlineKeyHolders,
              ...state.offLineKeyHolders,
            ],
          };
          const metaStatus = get().getTopLobbyMetaStatus();
          if (metaStatus === "keyholder-able-to-unlock") {
            return newState;
          }

          return {
            ...newState,
            state: "connecting",
            connecting: true,
          };
        }),
      setPartialStateUpdate: (payload: Parameters<SetPartialStateUpdate>[0]) =>
        set((state) => {
          const filteredPayload: Omit<typeof payload, "unlockingStartDate"> & {
            unlockingStartDate?: Date | null;
          } = {};

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
                newOnlineKeyHolders.every(
                  (newOnlineKh) => newOnlineKh.id !== kh.id,
                ),
            );

            filteredPayload.onlineKeyHolders = newOnlineKeyHolders;
            filteredPayload.offLineKeyHolders = newOffLineKeyHolders;
          }

          if (payload.unlockingStartDate !== undefined) {
            const payloadStartDate =
              payload.unlockingStartDate === null
                ? null
                : safeParseAndCheckRecent(payload.unlockingStartDate);

            // only one null means dates are different
            if (
              [payloadStartDate, state.unlockingStartDate].filter(
                (x) => x === null,
              ).length === 1
            ) {
              filteredPayload.unlockingStartDate = payloadStartDate;
            } else if (
              !!payloadStartDate &&
              !!state.unlockingStartDate &&
              !isEqual(
                startOfSecond(payloadStartDate),
                startOfSecond(state.unlockingStartDate),
              )
            )
              filteredPayload.unlockingStartDate = payloadStartDate;
          }

          return filteredPayload;
        }),
      hasEnoughKeysToUnlock: () => {
        const { receivedKeysByKeyHolderId, keyThreshold, key } = get();

        const receivedKeysNumber = Object.keys(
          receivedKeysByKeyHolderId ?? {},
        ).length;

        const hasKeyHimself = !!key?.trim();
        return receivedKeysNumber + (hasKeyHimself ? 1 : 0) >= keyThreshold;
      },
      cannotConnectLeader: (
        reason: JoinLockedBoxStateData["connectionToLeaderFailReason"],
      ) =>
        set({
          connectionToLeaderFailReason: reason,
        }),
    },
  })),
);

const getDataRequiredToCalculateMetaStatus = (
  state: JoinLockedBoxStateData,
): DataRequiredToCalculateMetaStatus => {
  return {
    currentKeyHolderId: state.you.id,
    keyThreshold: state.keyThreshold,
    hasKeyHimself: state.key?.trim() !== undefined,
    receivedKeysNumber: Object.keys(state.receivedKeysByKeyHolderId ?? {})
      .length,
    state: state.state,
    shareAccessKeyMapByKeyHolderId: state.shareAccessKeyMapByKeyHolderId,
  };
};

if (import.meta.env.DEV === true) {
  //@ts-expect-error
  window.useJoinLockedBoxStore = {
    connectAllOffLineKeyholders: () => {
      const {
        offLineKeyHolders,
        actions: { connectKeyHolder },
      } = useJoinLockedBoxStore.getState();

      offLineKeyHolders.forEach(connectKeyHolder);
    },
    setReadyToUnlock: () => {
      useJoinLockedBoxStore.getState().actions.setReadyToUnlock();
      const nowMinus2Minutes = new Date(Date.now() - 2 * 60 * 1000);
      useJoinLockedBoxStore
        .getState()
        .actions.setUnlockingStartDate(nowMinus2Minutes);
    },
    addReceivedKey: (arg: { fromKeyHolderId: string; key: string }) => {
      useJoinLockedBoxStore.getState().actions.addReceivedKey(arg);
      //@ts-expect-error
      window.useJoinLockedBoxStore.setReadyToUnlock();
    },
  };
}
