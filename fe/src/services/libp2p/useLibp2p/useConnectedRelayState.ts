import { useEffect, useState } from "react";
import { getBootstrapMultiaddrs } from "../get-bootstrap-multiaddrs";

export function useConnectedRelayState() {
  const [relaysConnected, setRelaysConnected] = useState({
    connected: 0,
    max: getBootstrapMultiaddrs().relayPeerIds.length,
  });

  const [isInitiallyConnecting, setIsInitiallyConnecting] = useState(true);

  useEffect(() => {
    setIsInitiallyConnecting((prev) =>
      prev ? !(relaysConnected.connected > 0) : false,
    );
  }, [relaysConnected]);

  const isRelayReconnecting =
    relaysConnected.connected === 0 && !isInitiallyConnecting;

  return {
    relaysConnected,
    setRelaysConnected,
    isInitiallyConnecting,
    isRelayReconnecting,
  };
}
