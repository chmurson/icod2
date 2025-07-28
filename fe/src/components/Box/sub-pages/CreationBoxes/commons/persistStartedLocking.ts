const keyNameForSessionId = "icod2-last-started-locking-box-session-id";

export const persistStartedLocking = (sessionId: string) => {
  sessionStorage.setItem(keyNameForSessionId, sessionId);
};

export const isPersistedStartedLocking = (sessonId: string) => {
  return (
    sessonId.trim() !== "" &&
    sessionStorage.getItem(keyNameForSessionId) === sessonId
  );
};

export const clearPersistedStartedLockingInfo = () => {
  sessionStorage.removeItem(keyNameForSessionId);
};
