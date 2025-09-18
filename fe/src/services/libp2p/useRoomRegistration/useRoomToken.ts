import { useCallback, useMemo } from "react";
import { useParams } from "react-router-dom";
import type { RoomTokenProvider } from "@/services/libp2p/room-token-provider";
import { generateNiceRandomToken } from "@/utils/generateNiceRandomToken";

const keyNameForRoomToken = "icod2-last-started-locking-box-room-token";

export const useRoomToken = () => {
  const { roomToken: token } = useParams();

  const roomTokenProvider: RoomTokenProvider = useMemo(
    () => ({
      getRoomToken: async () => {
        return token;
      },
    }),
    [token],
  );

  const generateAndPersistRoomToken = useCallback(() => {
    const roomToken = generateNiceRandomToken(12);
    persistRoomToken(roomToken);
    return roomToken;
  }, []);

  return {
    roomTokenProvider,
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
