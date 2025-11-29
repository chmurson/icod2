import { useEffect } from "react";
import type {
  ConnectionErrors,
  Libp2pServiceErrors,
  RoomRegistrationErrors,
} from "@/services/libp2p";
import { useLeaderConnection } from "@/services/libp2p";
import { useOpenLockedBoxStore } from "@/stores/boxStore";
import { usePeerToHolderMapRef } from "../commons";
import { useOnChangeShareablePartOfState } from "./useSelectiveStatePusher";
import { useSendMessageProto } from "./useSendMessageProto";

export type ErrorTypes =
  | RoomRegistrationErrors
  | Libp2pServiceErrors
  | ConnectionErrors
  | undefined;

export function useOpenLockedBoxConnection({
  roomToken,
}: {
  roomToken: string | undefined;
}) {
  const {
    error,
    isRelayReconnecting,
    messageProto,
    peerId,
    roomRegistered,
    routerMng,
    connectedPeersStorageRef,
  } = useLeaderConnection({ roomToken });

  const { peerToKeyHolderMapRef } = usePeerToHolderMapRef();

  const { sendWelcome, sendPartialUpdate } = useSendMessageProto({
    peerMessageProtoRef: messageProto.peerMessageProtoRef,
  });

  useOnChangeShareablePartOfState({
    onChange: sendPartialUpdate,
  });

  useEffect(() => {
    const listenersToRemove = [
      connectedPeersStorageRef.current.addListener(
        "peer-added",
        (peerId, info) => {
          if (info.isRelay) {
            return;
          }
          sendWelcome(peerId);
        },
      ),
      connectedPeersStorageRef.current.addListener("peer-removed", (peerId) => {
        const keyHolderId = usePeerToHolderMapRef
          .getValue()
          .getKeyholderId(peerId);

        if (keyHolderId) {
          const { disconnectKeyHolder } =
            useOpenLockedBoxStore.getState().actions;
          disconnectKeyHolder(keyHolderId);
        }

        peerToKeyHolderMapRef.current.removeByPeerId(peerId);
      }),
    ];

    return () => {
      for (const removeListener of listenersToRemove) {
        removeListener();
      }
    };
  }, [peerToKeyHolderMapRef, sendWelcome, connectedPeersStorageRef]);

  return {
    roomRegistered,
    routerMng,
    error,
    isRelayReconnecting,
    messageProto,
    peerId,
  };
}
