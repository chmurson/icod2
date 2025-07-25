import { useMemo } from "react";

export function getTopLobbyMetaStatus(params: {
  state: string;
  hasKeyHimself: boolean;
  keyThreshold: number;
  currentKeyHolderId: string;
  shareAccessKeyMapByKeyHolderId: Record<string, Record<string, boolean>>;
  receivedKeysNumber: number;
}) {
  const {
    currentKeyHolderId,
    hasKeyHimself,
    keyThreshold,
    receivedKeysNumber,
    shareAccessKeyMapByKeyHolderId,
    state,
  } = params;

  const hasEnoughtKeysToUnlock = useIsTheNumberEnoughToReachTreshold({
    externalKeysNumber: receivedKeysNumber,
    hasKeyHimself,
    keyThreshold,
  });

  const shouldReceiveKeysNumber = useMemo(
    () =>
      Object.entries(shareAccessKeyMapByKeyHolderId)
        .map(([_, shareMap]) => {
          return shareMap[currentKeyHolderId] === true;
        })
        .filter((x) => x === true).length,
    [currentKeyHolderId, shareAccessKeyMapByKeyHolderId],
  );

  const shouldReceiveEnoughKeysToUnlock = useIsTheNumberEnoughToReachTreshold({
    externalKeysNumber: shouldReceiveKeysNumber,
    hasKeyHimself,
    keyThreshold,
  });

  if (state !== "ready-to-unlock") {
    return "not-ready-to-unlock";
  }

  if (shouldReceiveEnoughKeysToUnlock && hasEnoughtKeysToUnlock) {
    return "keyholder-able-to-unlock";
  }

  if (shouldReceiveEnoughKeysToUnlock && !hasEnoughtKeysToUnlock) {
    return "keyholder-not-yet-able-to-unlock";
  }

  return "keyholder-not-able-to-unlock";
}

function useIsTheNumberEnoughToReachTreshold({
  hasKeyHimself,
  externalKeysNumber,
  keyThreshold,
}: {
  hasKeyHimself: boolean;
  externalKeysNumber: number;
  keyThreshold: number;
}) {
  return useMemo(() => {
    return externalKeysNumber + (hasKeyHimself ? 1 : 0) >= keyThreshold;
  }, [keyThreshold, externalKeysNumber, hasKeyHimself]);
}
