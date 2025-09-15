import { useMemo } from "react";
import { useParams } from "react-router-dom";
import type { RoomTokenProvider } from "@/services/libp2p/room-token-provider";
import { generateNiceRandomToken } from "@/utils/generateNiceRandomToken";

const keyNameForSessionId = "icod2-last-started-locking-box-session-id";

export const useRoomToken = () => {
  const { sessionId: token } = useParams();

  const roomTokenProvider: RoomTokenProvider = useMemo(
    () => ({
      getRoomToken: async () => token,
    }),
    [token],
  );

  return {
    roomTokenProvider,
    generateAndPersistRoomToken: () => {
      const roomToken = generateNiceRandomToken();
      persistRoomToken(roomToken);
      return roomToken;
    },
  };
};

export const isPersistedRoomToken = (roomToken: string) => {
  return (
    roomToken.trim() !== "" &&
    sessionStorage.getItem(keyNameForSessionId) === roomToken
  );
};

export const clearPersistedRoomToken = () => {
  sessionStorage.removeItem(keyNameForSessionId);
};

const persistRoomToken = (roomToken: string) => {
  sessionStorage.setItem(keyNameForSessionId, roomToken);
};
