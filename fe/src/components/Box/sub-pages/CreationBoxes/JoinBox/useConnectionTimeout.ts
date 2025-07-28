import { useEffect, useRef } from "react";
import { useJoinBoxStore } from "@/stores";

const CONNECTION_TIMEOUT_MS = 10000;

export function useConnectionTimeout() {
  const timeoutRef = useRef<number>(undefined);
  const { connecting, connected, connectionToLeaderFailReason, actions } =
    useJoinBoxStore();

  useEffect(() => {
    if (connecting && !connected && !connectionToLeaderFailReason) {
      timeoutRef.current = window.setTimeout(() => {
        actions.cannotConnectLeader("timeout");
      }, CONNECTION_TIMEOUT_MS);
    } else {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = undefined;
      }
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [connecting, connected, connectionToLeaderFailReason, actions]);
}
