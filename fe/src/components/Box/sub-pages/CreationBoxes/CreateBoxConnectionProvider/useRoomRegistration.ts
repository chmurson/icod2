import { initRoomRegistrationProtocol } from "@icod2/protocols";
import type { Libp2p } from "@libp2p/interface";
import { useCallback, useEffect, useRef, useState } from "react";
import type { RoomTokenProvider } from "@/services/libp2p/room-token-provider";

export type RoomRegistrationErrors =
  | "room-registration-unknown-error"
  | "room-registration-timeout"
  | "room-registration-invalid-state";

export function useStartNewRegistrationProtocol({
  roomTokenProvider,
  onError,
  timeoutMs = 10_000,
  onRoomRegistered,
}: {
  roomTokenProvider: RoomTokenProvider;
  onRoomRegistered: () => void;
  onError?: (error: RoomRegistrationErrors) => void;
  timeoutMs?: number;
}) {
  const [relayPeerId, setRelayPeerId] = useState<string | undefined>(undefined);

  const roomRegistrationProtocolHandlers = useRef<
    ReturnType<typeof initRoomRegistrationProtocol> | undefined
  >(undefined);

  const libp2pRef = useRef<Libp2p | undefined>(undefined);
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;
  const onRoomRegisteredRef = useRef(onRoomRegistered);
  onRoomRegisteredRef.current = onRoomRegistered;
  const unregisterRoomAndCloseConnectionRef = useRef(() => {});
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    if (!roomRegistrationProtocolHandlers.current || !relayPeerId) {
      return () => {};
    }

    const { createPeerConnection, close, start } =
      roomRegistrationProtocolHandlers.current;

    start();

    let cancelled = false;

    (async () => {
      try {
        if (cancelled || !relayPeerId) return;
        const result = await createPeerConnection(relayPeerId);

        if (cancelled) return;
        const roomToken = await roomTokenProvider.getRoomToken();

        if (cancelled || !roomToken) return;

        await result.operations.registerRoom(roomToken);

        onRoomRegisteredRef.current?.();
        clearTimeout(timeoutRef.current);
      } catch (error) {
        if (cancelled) return;
        console.error("Error registering room:", error);
        onErrorRef.current?.("room-registration-unknown-error");
      }
    })();

    return () => {
      cancelled = true;
      close();
      unregisterRoomAndCloseConnectionRef.current?.();
      unregisterRoomAndCloseConnectionRef.current = () => {};
    };
  }, [roomTokenProvider, relayPeerId]);

  const tryToRegisterNewRoom = useCallback((libp2p: Libp2p, peerId: string) => {
    libp2pRef.current = libp2p;
    setRelayPeerId(peerId);
    roomRegistrationProtocolHandlers.current =
      initRoomRegistrationProtocol(libp2p);
  }, []);

  const timeoutStart = useCallback(() => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      console.log("Timeout reached");
      onErrorRef.current?.("room-registration-timeout");
    }, timeoutMs);
  }, [timeoutMs]);

  const retry = useCallback(() => {
    if (!libp2pRef.current) {
      onErrorRef.current?.("room-registration-invalid-state");
      return;
    }
    if (relayPeerId) {
      tryToRegisterNewRoom(libp2pRef.current, relayPeerId);
    }
  }, [relayPeerId, tryToRegisterNewRoom]);

  return {
    tryToRegisterNewRoom,
    timeoutStart,
    retry,
  };
}
