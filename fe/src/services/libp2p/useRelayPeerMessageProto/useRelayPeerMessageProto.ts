import { PeerMessageExchangeProtocol } from "@icod2/protocols";
import type { Libp2p } from "@libp2p/interface";
import { useEffect, useRef } from "react";

export const useRelayPeerMessageProto = () => {
  const peerMessageProtoRef = useRef<PeerMessageExchangeProtocol | undefined>(
    undefined,
  );

  useEffect(() => {
    const peerMessageProto = new PeerMessageExchangeProtocol({
      protocolId: "/icod2/relay-peer-message-exchange/1.0.0",
    });

    peerMessageProtoRef.current = peerMessageProto;
  }, []);

  return {
    initialize: (libp2p: Libp2p) => {
      peerMessageProtoRef.current?.initialize(libp2p);
    },
    peerMessageProtoRef,
  };
};
