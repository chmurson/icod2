import {
  PeerMessageExchangeProtocol,
  type PeerMessageListener,
} from "@icod2/protocols";
import type { Libp2p } from "@libp2p/interface";
import { useEffect, useRef } from "react";

export const usePeerMessageProto = <
  BasicMessagePayload extends Record<string, unknown>,
>({
  onMessageListener,
}: {
  onMessageListener?: PeerMessageListener<BasicMessagePayload>;
} = {}) => {
  const peerMessageProtoRef = useRef<
    PeerMessageExchangeProtocol<BasicMessagePayload> | undefined
  >(undefined);

  useEffect(() => {
    const peerMessageProto =
      new PeerMessageExchangeProtocol<BasicMessagePayload>({
        onMessage: onMessageListener,
      });

    peerMessageProtoRef.current = peerMessageProto;
  }, [onMessageListener]);

  return {
    initialize: (libp2p: Libp2p) => {
      peerMessageProtoRef.current?.initialize(libp2p);
    },
    peerMessageProtoRef,
  };
};
