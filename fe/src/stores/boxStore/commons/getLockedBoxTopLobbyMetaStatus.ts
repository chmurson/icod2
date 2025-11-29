import type { LockedBoxStoreCommonPart } from "../common-types";

export type DataRequiredToCalculateMetaStatus = {
  state: LockedBoxStoreCommonPart["state"];
  hasKeyHimself: boolean;
  keyThreshold: number;
  currentKeyHolderId: string;
  shareAccessKeyMapByKeyHolderId: Record<string, Record<string, boolean>>;
  receivedKeysNumber: number;
};

export const getLockedBoxTopLobbyMetaStatus = (
  data: DataRequiredToCalculateMetaStatus,
) => {
  const {
    currentKeyHolderId,
    hasKeyHimself,
    keyThreshold,
    receivedKeysNumber,
    shareAccessKeyMapByKeyHolderId,
    state,
  } = data;

  const hasEnoughtKeysToUnlock =
    receivedKeysNumber + (hasKeyHimself ? 1 : 0) >= keyThreshold;

  const shouldReceiveKeysNumber = Object.entries(shareAccessKeyMapByKeyHolderId)
    .map(([_, shareMap]) => {
      return shareMap[currentKeyHolderId] === true;
    })
    .filter((x) => x === true).length;

  const shouldReceiveEnoughKeysToUnlock =
    shouldReceiveKeysNumber + (hasKeyHimself ? 1 : 0) >= keyThreshold;

  if (state === "connecting") {
    return "connecting";
  }

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
};
