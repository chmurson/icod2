import { useJoinLockedBoxStore } from "@/stores/boxStore/joinLockedBoxStore";
import { getTopLobbyMetaStatus } from "../../commons";

export function useGetTopLobbyMetaStatus() {
  const state = useJoinLockedBoxStore((state) => state.state);

  const hasKeyHimself = useJoinLockedBoxStore(
    (state) => state.key?.trim() !== "",
  );

  const shareAccessKeyMapByKeyHolderId = useJoinLockedBoxStore(
    (state) => state.shareAccessKeyMapByKeyHolderId,
  );

  const you = useJoinLockedBoxStore((state) => state.you);

  const receivedKeysNumber = useJoinLockedBoxStore(
    (state) => Object.keys(state.receivedKeysByKeyHolderId ?? {}).length,
  );

  const keyThreshold = useJoinLockedBoxStore((state) => state.keyThreshold);

  return getTopLobbyMetaStatus({
    state,
    currentKeyHolderId: you.id,
    keyThreshold,
    receivedKeysNumber,
    shareAccessKeyMapByKeyHolderId,
    hasKeyHimself,
  });
}
