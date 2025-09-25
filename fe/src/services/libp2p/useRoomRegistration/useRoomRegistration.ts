// useRoomRegistration.ts - Thin React wrapper

import type { Libp2p } from "@libp2p/interface";
import { useCallback, useEffect, useRef } from "react";
import type { ConnectedPeerStorage } from "@/services/libp2p/connected-peer-storage";
import type { RoomTokenProvider } from "@/services/libp2p/room-token-provider";
import {
  type RoomRegistrationCallbacks,
  type RoomRegistrationErrors,
  RoomRegistrationService,
} from "./RoomRegistrationService";

export type { RoomRegistrationErrors } from "./RoomRegistrationService";

export function useRoomRegistration({
  roomTokenProvider,
  connectedPeersStorage,
  onRoomRegistered,
  onError,
  timeoutMs = 10_000,
}: {
  connectedPeersStorage: ConnectedPeerStorage;
  roomTokenProvider: RoomTokenProvider;
  onRoomRegistered: () => void;
  onError?: (error: RoomRegistrationErrors) => void;
  timeoutMs?: number;
}) {
  const serviceRef = useRef<RoomRegistrationService>(undefined);
  const initialCallbacks = useRef<RoomRegistrationCallbacks>({
    onRoomRegistered,
    onError,
  });

  useEffect(() => {
    serviceRef.current = new RoomRegistrationService(
      roomTokenProvider,
      connectedPeersStorage,
      initialCallbacks.current,
      timeoutMs,
    );

    return () => {
      serviceRef.current?.destroy();
    };
  }, [roomTokenProvider, connectedPeersStorage, timeoutMs]);

  useEffect(() => {
    if (serviceRef.current) {
      serviceRef.current.updateCallbacks({ onRoomRegistered, onError });
    }
  }, [onRoomRegistered, onError]);

  const initialize = useCallback((libp2p: Libp2p) => {
    serviceRef.current?.initialize(libp2p);
  }, []);

  return {
    initialize,
  };
}
