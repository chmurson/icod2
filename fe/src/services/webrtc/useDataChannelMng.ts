import { type RefObject, useEffect, useRef } from "react";
import { DataChannelManager } from "@/services/webrtc";
import type { PossibleSignalingServie } from "@/services/webrtc/DataChannelManager";
import { createWebsocketConnection } from "@/services/websocket/createWebsocketConnection";
import type { WebsocketJSONHandler } from "@/services/websocket/WebSocketJSONHandler";
import type { DataChannelMessageRouter } from "./DataChannelMessageRouter";

export const useDataChannelMng = <
  TSignalingService extends PossibleSignalingServie<TConnectionFailReason>,
  TConnectionFailReason = unknown,
>({
  onPeerConnected,
  onPeerDisconnected,
  ref,
  SignalingService,
  router,
}: {
  onPeerConnected?: (localId: string) => void;
  onPeerDisconnected?: (localId: string) => void;
  ref?: RefObject<
    DataChannelManager<TSignalingService, TConnectionFailReason> | undefined
  >;
  router:
    | ((
        localID: string,
        data: object,
        dataChannelManager: DataChannelManager<
          TSignalingService,
          TConnectionFailReason
        >,
      ) => void)
    | DataChannelMessageRouter<TSignalingService, TConnectionFailReason>;
  SignalingService: new (arg: WebsocketJSONHandler) => TSignalingService;
}) => {
  const dataChannelMngRef = useRef<
    DataChannelManager<TSignalingService, TConnectionFailReason> | undefined
  >(undefined);

  useEffect(() => {
    const dataChannelManager = new DataChannelManager({
      signalingService: new SignalingService(createWebsocketConnection()),
      callbacks: {
        onPeerConnected: (localId) => {
          console.log("Peer connected:", localId);
          onPeerConnected?.(localId);
        },
        onPeerDisconnected: (localId) => {
          onPeerDisconnected?.(localId);
          console.log("Peer disconnected:", localId);
        },
        onFailedToConnect: (reason) => {
          console.error("Failed to connect:", reason);
        },
        onConnected: () => {
          console.log("Connected to signaling service");
        },
        onDataChannelMessage: router,
      },
    });

    dataChannelManager.start();
    dataChannelMngRef.current = dataChannelManager;

    return () => {
      dataChannelManager.close();
    };
  }, [onPeerConnected, onPeerDisconnected, SignalingService, router]);

  useEffect(() => {
    if (ref) {
      ref.current = dataChannelMngRef.current;
    }
  }, [ref]);

  useRaiseErrorIfChanges(router, "router");
  useRaiseErrorIfChanges(SignalingService, "SignalingService");
  useRaiseErrorIfChanges(onPeerConnected, "onPeerConnected");
  useRaiseErrorIfChanges(onPeerDisconnected, "onPeerDisconnected");

  return { dataChannelMngRef };
};

const useRaiseErrorIfChanges = (value: unknown, valueName: string) => {
  const previousValueRef = useRef(value);
  const valueNameRef = useRef(valueName);

  useEffect(() => {
    if (previousValueRef.current !== value) {
      throw new Error(
        `"${valueNameRef}": value has changed unexpectedly; this value should not change;`,
      );
    }

    previousValueRef.current = value;
  }, [value]);
};
