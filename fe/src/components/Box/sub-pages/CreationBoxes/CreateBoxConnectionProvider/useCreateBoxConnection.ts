import { useLeaderConnection } from "@/services/libp2p/connection-setups";

export function useCreateBoxConnection({ roomToken }: { roomToken: string }) {
  const {
    error,
    isRelayReconnecting,
    messageProto,
    peerId,
    retryRoomRegistration,
    roomRegistered,
    routerMng,
  } = useLeaderConnection({ roomToken });

  return {
    error,
    isRelayReconnecting,
    messageProto,
    peerId,
    retryRoomRegistration,
    roomRegistered,
    routerMng,
  };
}
