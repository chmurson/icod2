import {
  createContext,
  type FC,
  type PropsWithChildren,
  useContext,
  useMemo,
} from "react";
import { useCreateBoxStore } from "@/stores";
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
  const roomToken = useCreateBoxStore((state) => state.roomToken);

  const {
    error,
    retryRoomRegistration,
    roomRegistered,
    routerMng,
    isRelayReconnecting,
    messageProto,
    peerId,
  } = useCreateBoxConnection({ roomToken }) ?? {};

  const value = useMemo(() => {
    return {
      error,
      retryRoomRegistration,
      roomRegistered,
      routerMng,
      isRelayReconnecting,
      messageProto,
      peerId,
    };
  }, [
    error,
    retryRoomRegistration,
    roomRegistered,
    routerMng,
    isRelayReconnecting,
    messageProto,
    peerId,
  ]);

  return <Provider value={value}>{children}</Provider>;
};
