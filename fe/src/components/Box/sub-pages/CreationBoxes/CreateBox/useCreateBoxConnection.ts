import { useCallback, useEffect, useRef } from "react";
import { CalleeSignalingService } from "@/services/signaling";
import { DataChannelManager } from "@/services/webrtc";
import { DataChannelMessageRouter } from "@/services/webrtc/DataChannelMessageRouter";
import { createWebsocketConnection } from "@/services/websocket/createWebsocketConnection";
import { useCreateBoxStore } from "@/stores";
import {
  isKeyHolderWelcomesLeader,
  type LeaderSendsBoxCreated,
  type LeaderSendsBoxUpdate,
  type LeaderWelcomesKeyholder,
} from "../commons";

const router = new DataChannelMessageRouter();

router.addHandler(
  isKeyHolderWelcomesLeader,
  (localId, message, dataChannelMng) => {
    const storeActions = useCreateBoxStore.getState().actions;

    storeActions.connectParticipant({
      id: localId,
      name: message.name,
      userAgent: message.userAgent,
    });

    const state = useCreateBoxStore.getState();

    dataChannelMng?.sendMessageToSinglePeer(localId, {
      boxInfo: {
        keyHolderTreshold: state.threshold,
        name: state.title,
      },
      leaderInfo: {
        id: state.leader.id,
        name: state.leader.name,
        userAgent: state.leader.userAgent,
      },
      yourId: localId,
      type: "leader:welcome-keyholder",
    } satisfies LeaderWelcomesKeyholder);
  },
);

export function useCreateBoxConnection() {
  const dataChannelMngRef = useCreateBoxDataChannel();

  const sendBoxUpdate = useCallback(
    ({
      title,
      keyHolderTreshold,
    }: {
      title: string;
      keyHolderTreshold: number;
    }) => {
      dataChannelMngRef.current?.sendMessageToAllPeers({
        type: "leader:sends-box-update",
        boxInfo: {
          name: title,
          keyHolderTreshold: keyHolderTreshold,
        },
      } satisfies LeaderSendsBoxUpdate);
    },
    [dataChannelMngRef],
  );

  const sendBoxCreated = useCallback(
    ({
      encryptedMessage,
      key,
      localPeerID,
    }: {
      localPeerID: string;
      key: string;
      encryptedMessage: string;
    }) => {
      dataChannelMngRef.current?.sendMessageToSinglePeer(localPeerID, {
        type: "leader:box-created",
        key,
        encryptedMessage,
      } satisfies LeaderSendsBoxCreated);
    },
    [dataChannelMngRef],
  );

  return {
    sendBoxUpdate,
    sendBoxCreated,
  };
}

function useCreateBoxDataChannel() {
  const storeActions = useCreateBoxStore((state) => state.actions);
  const dataChannelManagerRef = useRef<
    DataChannelManager<CalleeSignalingService> | undefined
  >(undefined);

  useEffect(() => {
    const dataChannelManager = new DataChannelManager({
      signalingService: new CalleeSignalingService(createWebsocketConnection()),
      callbacks: {
        onPeerConnected: (localId) => {
          console.log("Peer connected:", localId);
        },
        onPeerDisconnected: (localId) => {
          console.log("Peer disconnected:", localId);
          storeActions.disconnectParticipant(localId);
        },
        onFailedToConnect: (reason) => {
          console.error("Failed to connect:", reason);
        },
        onConnected: () => {
          console.log("Connected to signaling service");
        },
        onDataChannelMessage: router.router,
      },
    });

    dataChannelManager.start();
    dataChannelManagerRef.current = dataChannelManager;

    return () => {
      dataChannelManagerRef.current = undefined;
      dataChannelManager.close();
    };
  }, [storeActions]);

  return dataChannelManagerRef;
}
