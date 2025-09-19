import { useCallback } from "react";
import { generateNiceRandomToken } from "@/utils/generateNiceRandomToken";

const keyNameForRoomToken = "icod2-last-started-locking-box-room-token";

export const useRoomToken = () => {
  const generateAndPersistRoomToken = useCallback(() => {
    const roomToken = generateNiceRandomToken(12);
    persistRoomToken(roomToken);
    return roomToken;
  }, []);

  return {
    generateAndPersistRoomToken,
  };
};

export const isPersistedRoomToken = (roomToken: string) => {
  return (
    roomToken.trim() !== "" &&
    sessionStorage.getItem(keyNameForRoomToken) === roomToken
  );
};

export const clearPersistedRoomToken = () => {
  sessionStorage.removeItem(keyNameForRoomToken);
};

const persistRoomToken = (roomToken: string) => {
  sessionStorage.setItem(keyNameForRoomToken, roomToken);
};
