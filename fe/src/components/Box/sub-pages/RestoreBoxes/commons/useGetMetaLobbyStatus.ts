import type { StoreApi, UseBoundStore } from "zustand";
import type { LockedBoxStoreCommonPart } from "@/stores/boxStore/common-types";
import { getTopLobbyMetaStatus } from "./getMetaLobbyStatus";

type StoreStateSubset = Pick<
  LockedBoxStoreCommonPart,
  | "keyThreshold"
  | "key"
  | "you"
  | "state"
  | "shareAccessKeyMapByKeyHolderId"
  | "receivedKeysByKeyHolderId"
>;

export function useGetTopLobbyMetaStatus(
  useStoreHook: UseBoundStore<StoreApi<StoreStateSubset>>,
) {
  const state = useStoreHook((state) => state.state);

  const hasKeyHimself = useStoreHook((state) => state.key?.trim() !== "");

  const shareAccessKeyMapByKeyHolderId = useStoreHook(
    (state) => state.shareAccessKeyMapByKeyHolderId,
  );

  const you = useStoreHook((state) => state.you);

  const receivedKeysNumber = useStoreHook(
    (state) => Object.keys(state.receivedKeysByKeyHolderId ?? {}).length,
  );

  const keyThreshold = useStoreHook((state) => state.keyThreshold);

  return getTopLobbyMetaStatus({
    state,
    currentKeyHolderId: you.id,
    keyThreshold,
    receivedKeysNumber,
    shareAccessKeyMapByKeyHolderId,
    hasKeyHimself,
  });
}
