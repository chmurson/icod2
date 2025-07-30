import { useCallback, useRef, useState } from "react";

interface UseAsyncResolverOptions {
  timeoutMs?: number;
}

export function useAsyncResolver(options: UseAsyncResolverOptions = {}) {
  const { timeoutMs = 30000 } = options;

  const promiseResolveRef = useRef<{ resolve: () => void; reject: () => void }>(
    undefined,
  );
  const timeoutRef = useRef<number>(undefined);
  const [isPromiseCreated, setIsPromiseCreated] = useState(false);

  const createPromise = useCallback(() => {
    return new Promise<void>((resolve, reject) => {
      promiseResolveRef.current = {
        resolve,
        reject,
      };
      setIsPromiseCreated(true);

      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = window.setTimeout(() => {
        setIsPromiseCreated(false);
        resolve();
      }, timeoutMs);
    });
  }, [timeoutMs]);

  const resolvePromise = useCallback(() => {
    if (!promiseResolveRef.current) {
      return;
    }

    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }
    promiseResolveRef.current.resolve();
    promiseResolveRef.current = undefined;
    setIsPromiseCreated(false);
  }, []);

  const rejectPromise = useCallback(() => {
    if (!promiseResolveRef.current) {
      return;
    }

    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }

    promiseResolveRef.current.reject();
    promiseResolveRef.current = undefined;
    setIsPromiseCreated(false);
  }, []);

  return {
    createPromise,
    resolvePromise,
    rejectPromise,
    isPromiseCreated,
  };
}
