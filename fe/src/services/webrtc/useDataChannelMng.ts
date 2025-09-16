import { loggerGate } from "@icod2/protocols";
import { type RefObject, useCallback, useEffect, useRef } from "react";
import { DataChannelManager } from "@/services/webrtc";
import type { PossibleSignalingServie } from "@/services/webrtc/DataChannelManager";
import { createWebsocketConnection } from "@/services/websocket/createWebsocketConnection";
import type { WebsocketJSONHandler } from "@/services/websocket/WebSocketJSONHandler";
import type { DataChannelMessageRouter } from "./DataChannelMessageRouter";

type RouterFunction<
  TSignalingService extends PossibleSignalingServie<TConnectionFailReason>,
  TConnectionFailReason = unknown,
> = (
  localID: string,
  data: object,
  dataChannelManager: DataChannelManager<
    TSignalingService,
    TConnectionFailReason
  >,
) => void;

type RouterItem<
  TSignalingService extends PossibleSignalingServie<TConnectionFailReason>,
  TConnectionFailReason = unknown,
> = {
  id: string;
  router:
    | RouterFunction<TSignalingService, TConnectionFailReason>
    | DataChannelMessageRouter<TSignalingService, TConnectionFailReason>;
};

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
  router?:
    | RouterFunction<TSignalingService, TConnectionFailReason>
    | DataChannelMessageRouter<TSignalingService, TConnectionFailReason>;
  SignalingService: new (arg: WebsocketJSONHandler) => TSignalingService;
}) => {
  const dataChannelMngRef = useRef<
    DataChannelManager<TSignalingService, TConnectionFailReason> | undefined
  >(undefined);

  const routersRef = useRef<
    Map<string, RouterItem<TSignalingService, TConnectionFailReason>>
  >(new Map());

  const onPeerConnectedRef = useRef(onPeerConnected);
  const onPeerDisconnectedRef = useRef(onPeerDisconnected);
  const onFailedToConnectRef = useRef(onFailedToConnect);

  onPeerConnectedRef.current = onPeerConnected;
  onPeerDisconnectedRef.current = onPeerDisconnected;
  onFailedToConnectRef.current = onFailedToConnect;

  // Combined router function that calls all registered routers
  const combinedRouter = useCallback(
    (
      localID: string,
      data: object,
      dataChannelManager: DataChannelManager<
        TSignalingService,
        TConnectionFailReason
      >,
    ) => {
      const routers = Array.from(routersRef.current.values());

      for (const routerItem of routers) {
        try {
          if (typeof routerItem.router === "function") {
            routerItem.router(localID, data, dataChannelManager);
          } else {
            // It's a DataChannelMessageRouter instance
            routerItem.router.router(localID, data, dataChannelManager);
          }
        } catch (error) {
          loggerGate.canError &&
            console.error(`Error in router ${routerItem.id}:`, error);
        }
      }
    },
    [],
  );

  useEffect(() => {
    if (!router) {
      return () => {};
    }

    const initialRouterId = "initial-router";
    routersRef.current.set(initialRouterId, {
      id: initialRouterId,
      router,
    });

    return () => {
      routersRef.current.delete(initialRouterId);
    };
  }, [router]);

  useEffect(() => {
    const webSocketConnection = createWebsocketConnection();
    const dataChannelManager = new DataChannelManager({
      signalingService: new SignalingService(webSocketConnection),
      callbacks: {
        onPeerConnected: (localId) => {
          loggerGate.canLog && console.log("Peer connected:", localId);
          onPeerConnectedRef.current?.(localId);
        },
        onPeerDisconnected: (localId) => {
          onPeerDisconnectedRef.current?.(localId);
          loggerGate.canLog && console.log("Peer disconnected:", localId);
        },
        onFailedToConnect: (reason) => {
          onFailedToConnectRef.current?.(reason);
          loggerGate.canError && console.error("Failed to connect:", reason);
        },
        onPeerConnecting: () => {
          loggerGate.canLog && console.log("New peer connecting...");
        },
        onSignalingServerConnected: () => {
          loggerGate.canLog &&
            console.log(
              `Connected to signaling service at ${webSocketConnection.getUrl()}`,
            );
        },
        onDataChannelMessage: combinedRouter,
      },
    });

    dataChannelManager.start();
    dataChannelMngRef.current = dataChannelManager;

    return () => {
      dataChannelManager.close();
    };
  }, [SignalingService, combinedRouter]);

  useEffect(() => {
    if (ref) {
      ref.current = dataChannelMngRef.current;
    }
  }, [ref]);

  const addRouter = useCallback(
    (
      id: string,
      routerToAdd:
        | RouterFunction<TSignalingService, TConnectionFailReason>
        | DataChannelMessageRouter<TSignalingService, TConnectionFailReason>,
    ) => {
      if (routersRef.current.has(id)) {
        loggerGate.canWarn &&
          console.warn(`Router with id "${id}" already exists. Replacing it.`);
      }

      routersRef.current.set(id, {
        id,
        router: routerToAdd,
      });
    },
    [],
  );

  const removeRouter = useCallback((id: string) => {
    const deleted = routersRef.current.delete(id);
    if (!deleted) {
      loggerGate.canWarn && console.warn(`Router with id "${id}" not found.`);
    }
    return deleted;
  }, []);

  const getRouterIds = useCallback(() => {
    return Array.from(routersRef.current.keys());
  }, []);

  const hasRouter = useCallback((id: string) => {
    return routersRef.current.has(id);
  }, []);

  const clearRouters = useCallback(() => {
    routersRef.current.clear();
  }, []);

  useRaiseErrorIfChanges(SignalingService, "SignalingService");

  return {
    dataChannelMngRef,
    addRouter,
    removeRouter,
    getRouterIds,
    hasRouter,
    clearRouters,
  };
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
