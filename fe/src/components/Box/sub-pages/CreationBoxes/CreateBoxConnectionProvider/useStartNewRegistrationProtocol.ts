import { initRoomRegistrationProtocol } from "@icod2/protocols";
import type { Libp2p } from "@libp2p/interface";
import { useCallback, useEffect, useRef, useState } from "react";
import type { RoomTokenProvider } from "@/services/libp2p/room-token-provider";

const relayPeerId = "asdasd";

export function useStartNewRegistrationProtocol({
  roomTokenProvider,
  onError,
}: {
  roomTokenProvider: RoomTokenProvider;
  onError?: () => void;
}) {
  const isCanelledRef = useRef(false);

  const [
    roomRegistrationProtocolHandlers,
    setRoomRegistrationProtocolHandlers,
  ] = useState<ReturnType<typeof initRoomRegistrationProtocol> | undefined>(
    undefined,
  );
  const libp2pRef = useRef<Libp2p | undefined>(undefined);

  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  const unregisterRoomAndCloseConnectionRef = useRef(() => {});

  useEffect(() => {
    if (!roomRegistrationProtocolHandlers) {
      return () => {};
    }

    const { attachOngoingStream, close, start } =
      roomRegistrationProtocolHandlers;

    start();

    (async () => {
      try {
        if (isCanelledRef.current) return;
        const result = await attachOngoingStream(relayPeerId);

        if (isCanelledRef.current) return;
        const roomToken = await roomTokenProvider.getRoomToken();

        if (isCanelledRef.current || !roomToken) return;

        await result.registerRoom(roomToken);

        unregisterRoomAndCloseConnectionRef.current = async () => {
          await result.unregisterRoom(roomToken);
          result.close();
        };
      } catch (error) {
        if (isCanelledRef.current) return;
        console.error("Error registering room:", error);
        onErrorRef.current?.();
      }
    })();

    return () => {
      isCanelledRef.current = true;
      close();
      unregisterRoomAndCloseConnectionRef.current?.();
      unregisterRoomAndCloseConnectionRef.current = () => {};
    };
  }, [roomRegistrationProtocolHandlers, roomTokenProvider]);

  const tryToRegisterNewRoom = useCallback((libp2p: Libp2p) => {
    libp2pRef.current = libp2p;
    const result = initRoomRegistrationProtocol(libp2p);
    setRoomRegistrationProtocolHandlers(result);
  }, []);

  return {
    tryToRegisterNewRoom,
  };
}
