const keyNameForSessionId = "icod2-last-started-unlocking-box-session-id";

export const persistStartedUnlocking = (sessionId: string) => {
  sessionStorage.setItem(keyNameForSessionId, sessionId);
};

export const isPersistedStartedUnlocking = (sessonId: string) => {
  return (
    sessonId.trim() !== "" &&
    sessionStorage.getItem(keyNameForSessionId) === sessonId
  );
};

export const clearPersistedStartedUnlockingInfo = () => {
  sessionStorage.removeItem(keyNameForSessionId);
};
