import { useEffect, useRef } from "react";
import { CallerSignalingService } from "@/services/signaling";
import { type DataChannelManager, useDataChannelMng } from "@/services/webrtc";
import { router } from "./dataChannelRouter";
import {useDataChannelSendMessages } from './dataChannelSendMessages'
import {useOnChangeShareablePartOfState } from './useSelectiveStatePusher'
import { PeerIdKeyholderMap } from '../commons/usePeerIdToKeyholderId'

export let peerToKeyHolderMap = new PeerIdKeyholderMap()

export function useJoinLockedBoxConnection() {
  const dataChannelManagerRef = useRef<
    DataChannelManager<CallerSignalingService> | undefined
  >(undefined);

  const peerToKeyHolderMapRef = useRef<PeerIdKeyholderMap>(new PeerIdKeyholderMap())

  useEffect(()=>{
    peerToKeyHolderMap = peerToKeyHolderMapRef.current
  },[peerToKeyHolderMapRef.current])

  const { sendPartialState, sendHelloToPeer } = useDataChannelSendMessages({
    dataChannelManagerRef,
  });

  useOnChangeShareablePartOfState({ onChange: sendPartialState });

  useDataChannelMng({
    SignalingService: CallerSignalingService,
    ref: dataChannelManagerRef,
    onPeerConnected: (peerId)=>{
      sendHelloToPeer(peerId)
    },
    onPeerDisconnected: (peerId) =>{
      peerToKeyHolderMapRef.current.removeByPeerId(peerId)
    },
    router: router,
  });

  return { dataChannelManagerRef };
}
