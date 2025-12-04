import { useEffect } from "react";
import { useFollowerConnection } from "@/services/libp2p";
import { useJoinLockedBoxStore } from "@/stores/boxStore/joinLockedBoxStore";
import { usePeerToHolderMapRef } from "../commons/usePeerToHolderMapRef";
import { router } from "./dataChannelRouter";
import { useDataChannelSendMessages } from "./dataChannelSendMessages";
import { keySharingWorkflowManager } from "./keySharingWorkflow";
import { useOnChangeShareablePartOfState } from "./useSelectiveStatePusher";

export type JoinBoxConnectionError = ReturnType<
  typeof useJoinLockedBoxConnection
>["error"];

export function useJoinLockedBoxConnection({
  roomToken,
}: {
  roomToken: string;
}) {
  const {
    error,
    messageProto,
    isRelayReconnecting,
    routerMng,
    connectedPeersStorageRef,
    libp2p,
  } = useFollowerConnection({
    roomToken,
  });

  useEffect(() => {
    routerMng.addRouter("join-unlock-box", router.router);
    routerMng.addRouter(
      "join-unlock-box-workflows",
      keySharingWorkflowManager.router,
    );

    console.log("useEffect in useJoinLockedBoxConnection");

    return () => {
      routerMng.removeRouter("join-unlock-box");
      routerMng.removeRouter("join-unlock-box-workflows");
    };
  }, [routerMng.addRouter, routerMng.removeRouter]);

  useEffect(() => {
    useJoinLockedBoxStore
      .getState()
      .actions.cannotConnectLeader(error ? "other" : undefined);
  }, [error]);

  const { peerToKeyHolderMapRef } = usePeerToHolderMapRef();

  const { sendPartialState, sendHelloToPeer } = useDataChannelSendMessages({
    peerMessageProtoRef: messageProto.peerMessageProtoRef,
  });

  useOnChangeShareablePartOfState({ onChange: sendPartialState });

  useEffect(() => {
    const listenersToRemove = [
      connectedPeersStorageRef.current.addListener(
        "peer-added",
        (peerId, info) => {
          if (!info.isRelay) {
            sendHelloToPeer(peerId);
          }
        },
      ),
      connectedPeersStorageRef.current.addListener("peer-removed", (peerId) => {
        const khId = peerToKeyHolderMapRef.current.getKeyholderId(peerId);
        peerToKeyHolderMapRef.current.removeByPeerId(peerId);
        const leaderKhId = useJoinLockedBoxStore.getState().connectedLeaderId;

        if (khId === leaderKhId) {
          useJoinLockedBoxStore.getState().actions.reactToDisconnectedLeader();
        }
      }),
    ];

    return () => {
      for (const removeListener of listenersToRemove) {
        removeListener();
      }
    };
  }, [sendHelloToPeer, peerToKeyHolderMapRef, connectedPeersStorageRef]);

  return {
    routerMng,
    error,
    isRelayReconnecting,
    peerMessageProtoRef: messageProto.peerMessageProtoRef,
    peerId: libp2p?.peerId,
  };
}
