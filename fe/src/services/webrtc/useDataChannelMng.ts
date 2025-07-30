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
  onFailedToConnect,
  ref,
  SignalingService,
  router,
}: {
  onPeerConnected?: (peerId: string) => void;
  onPeerDisconnected?: (peerId: string) => void;
  onFailedToConnect?: (reason: TConnectionFailReason) => void;
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

  const onPeerConnectedRef = useRef(onPeerConnected);
  const onPeerDisconnectedRef = useRef(onPeerDisconnected);
  const onFailedToConnectRef = useRef(onFailedToConnect);

  onPeerConnectedRef.current = onPeerConnected;
  onPeerDisconnectedRef.current = onPeerDisconnected;
  onFailedToConnectRef.current = onFailedToConnect;

  useEffect(() => {
    const webSocketConnection = createWebsocketConnection();
    const dataChannelManager = new DataChannelManager({
      signalingService: new SignalingService(webSocketConnection),
      callbacks: {
        onPeerConnected: (localId) => {
          console.log("Peer connected:", localId);
          onPeerConnectedRef.current?.(localId);
        },
        onPeerDisconnected: (localId) => {
          onPeerDisconnectedRef.current?.(localId);
          console.log("Peer disconnected:", localId);
        },
        onFailedToConnect: (reason) => {
          onFailedToConnectRef.current?.(reason);
          console.error("Failed to connect:", reason);
        },
        onPeerConnecting: () => {
          console.log("New peer connecting...");
        },
        onSignalingServerConnected: () => {
          console.log(
            `Connected to signaling service at ${webSocketConnection.getUrl()}`,
          );
        },
        onDataChannelMessage: router,
      },
    });

    dataChannelManager.start();
    dataChannelMngRef.current = dataChannelManager;

    return () => {
      dataChannelManager.close();
    };
  }, [SignalingService, router]);

  useEffect(() => {
    if (ref) {
      ref.current = dataChannelMngRef.current;
    }
  }, [ref]);

  useRaiseErrorIfChanges(router, "router");
  useRaiseErrorIfChanges(SignalingService, "SignalingService");

  return { dataChannelMngRef };
};

const useRaiseErrorIfChanges = (value: unknown, valueName: string) => {
  const previousValueRef = useRef(value);
  const valueNameRef = useRef(valueName);

  useEffect(() => {
    if (previousValueRef.current !== value) {
      throw new Error(
        `"${valueNameRef.current}": value has changed unexpectedly; this value should not change;`,
      );
    }

    previousValueRef.current = value;
  }, [value]);
};
