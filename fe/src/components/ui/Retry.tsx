import { Spinner } from "@radix-ui/themes";
import {
  createContext,
  type FC,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

interface RetryContextValue {
  retry: () => void;
}

const RetryContext = createContext<RetryContextValue | null>(null);

interface RetryProps {
  children: ReactNode;
}

export const Retry: FC<RetryProps> = ({ children }) => {
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  const retry = useCallback(() => {
    setIsRetrying(true);
    setTimeout(() => {
      setRetryKey((prev) => prev + 1);
      setIsRetrying(false);
    }, 2500);
  }, []);

  const contextValue: RetryContextValue = useMemo(
    () => ({
      retry,
    }),
    [retry],
  );

  if (isRetrying) {
    return <Spinner size="3" />;
  }

  return (
    <RetryContext.Provider value={contextValue}>
      <div key={retryKey}>{children}</div>
    </RetryContext.Provider>
  );
};

export const useRetry = (): RetryContextValue => {
  const context = useContext(RetryContext);

  if (!context) {
    throw new Error("useRetry must be used within a Retry component");
  }

  return context;
};
