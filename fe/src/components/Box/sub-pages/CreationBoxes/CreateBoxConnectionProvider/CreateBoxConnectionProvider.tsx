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
  const { dataChannelMng2, routerMng } = useCreateBoxConnection() ?? {};

  const value = useMemo(() => {
    return {
      dataChannelMng2,
      routerMng,
    };
  }, [dataChannelMng2, routerMng]);

  return <Provider value={value}>{children}</Provider>;
};
