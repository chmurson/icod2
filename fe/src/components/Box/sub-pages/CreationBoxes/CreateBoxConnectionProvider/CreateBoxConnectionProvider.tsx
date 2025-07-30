import {
  createContext,
  type FC,
  type PropsWithChildren,
  useContext,
  useMemo,
} from "react";
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
  const {
    addRouter,
    clearRouters,
    dataChannelMngRef,
    getRouterIds,
    hasRouter,
    removeRouter,
  } = useCreateBoxConnection();

  const value = useMemo(() => {
    return {
      addRouter,
      clearRouters,
      dataChannelMngRef,
      getRouterIds,
      hasRouter,
      removeRouter,
    };
  }, [
    addRouter,
    clearRouters,
    dataChannelMngRef,
    getRouterIds,
    hasRouter,
    removeRouter,
  ]);

  return <Provider value={value}>{children}</Provider>;
};
