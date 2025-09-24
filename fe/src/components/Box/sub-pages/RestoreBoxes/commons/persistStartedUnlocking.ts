const keyNameForRoomToken = "icod2-last-started-unlocking-box-session-id";

export const persistStartedUnlocking = (roomToken: string) => {
  sessionStorage.setItem(keyNameForRoomToken, roomToken);
};

export const isPersistedStartedUnlocking = (sessonId: string) => {
  return (
    sessonId.trim() !== "" &&
    sessionStorage.getItem(keyNameForRoomToken) === sessonId
  );
};

export const clearPersistedStartedUnlockingInfo = () => {
  sessionStorage.removeItem(keyNameForRoomToken);
};
