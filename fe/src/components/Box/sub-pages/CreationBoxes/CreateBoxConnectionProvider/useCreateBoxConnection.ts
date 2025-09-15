import { useRouterManager } from "@/services/libp2p/router-manager";
import { useDataChannelMng2 } from "@/services/libp2p/useDataChannelMng2";
import { useRoomToken } from "../commons/useRoomToken";
import { useStartNewRegistrationProtocol } from "./useStartNewRegistrationProtocol";

export function useCreateBoxConnection() {
  const { roomTokenProvider } = useRoomToken();

  const { tryToRegisterNewRoom } = useStartNewRegistrationProtocol({
    roomTokenProvider: roomTokenProvider,
    onError: () => {
      console.error("Error starting registration protocol:");
    },
  });

  const dataChannelMng2 = useDataChannelMng2({
    roomTokenProvider: roomTokenProvider,
    onLibp2pStarted: (libp2p) => tryToRegisterNewRoom(libp2p),
  });

  const routerMng = useRouterManager();

  return {
    dataChannelMng2,
    routerMng,
  };
}
