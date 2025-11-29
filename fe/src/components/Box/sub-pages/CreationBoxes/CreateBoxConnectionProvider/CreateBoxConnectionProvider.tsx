import {
  createContext,
  type FC,
  type PropsWithChildren,
  useContext,
  useMemo,
} from "react";
import { useCreateBoxStore, useDownloadBoxStore } from "@/stores";
import { useCreateBoxConnection } from "./useCreateBoxConnection";

type CreateBoxConnectionContext = ReturnType<typeof useCreateBoxConnection>;
type SafeCreateBoxConnectionContext = CreateBoxConnectionContext;

export const createBoxConnectionContext =
  createContext<CreateBoxConnectionContext | null>(null);

const { Provider } = createBoxConnectionContext;

export const useCreateBoxConnectionContext =
  (): SafeCreateBoxConnectionContext => {
    const context = useContext(createBoxConnectionContext);

    if (context === null) {
      throw new Error("createBoxConnectionContext is null");
    }

    return context;
  };

export const CreateBoxConnectionProvider: FC<PropsWithChildren> = ({
  children,
}) => {
  const roomTokenFromCreateBoxStore = useCreateBoxStore(
    (state) => state.roomToken,
  );
  const roomTokenFromJoinBoxStore = useDownloadBoxStore((state) =>
    state.type === "fromCreateBox" ? state.state.roomToken : undefined,
  );

  const roomToken = roomTokenFromCreateBoxStore || roomTokenFromJoinBoxStore;

  const {
    error,
    roomRegistered,
    routerMng,
    isRelayReconnecting,
    messageProto,
    peerId,
  } = useCreateBoxConnection({ roomToken }) ?? {};

  const value = useMemo(() => {
    return {
      error,
      roomRegistered,
      routerMng,
      isRelayReconnecting,
      messageProto,
      peerId,
    };
  }, [
    error,
    roomRegistered,
    routerMng,
    isRelayReconnecting,
    messageProto,
    peerId,
  ]);

  return <Provider value={value}>{children}</Provider>;
};
