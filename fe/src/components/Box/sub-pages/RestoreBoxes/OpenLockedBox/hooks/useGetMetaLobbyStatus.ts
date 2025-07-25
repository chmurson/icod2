import { useOpenLockedBoxStore } from "@/stores/boxStore";
import { getTopLobbyMetaStatus } from "../../commons";

export function useGetTopLobbyMetaStatus() {
  const state = useOpenLockedBoxStore((state) => state.state);

  const hasKeyHimself = useOpenLockedBoxStore(
    (state) => state.key?.trim() !== "",
  );

  const shareAccessKeyMapByKeyHolderId = useOpenLockedBoxStore(
    (state) => state.shareAccessKeyMapByKeyholderId,
  );

  const you = useOpenLockedBoxStore((state) => state.you);

  const receivedKeysNumber = useOpenLockedBoxStore(
    (state) => Object.keys(state.receivedKeysByKeyHolderId ?? {}).length,
  );

  const keyThreshold = useOpenLockedBoxStore((state) => state.keyThreshold);

  return getTopLobbyMetaStatus({
    state,
    currentKeyHolderId: you.id,
    keyThreshold,
    receivedKeysNumber,
    shareAccessKeyMapByKeyHolderId,
    hasKeyHimself,
  });
}
