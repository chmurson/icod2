import { useCallback } from "react";

interface UsePersistInLocalStorageProps {
  keyName: string;
}

export const usePersistInLocalStorage = <T>({
  keyName,
}: UsePersistInLocalStorageProps) => {
  const setValue = useCallback(
    (value: T) => {
      try {
        window.localStorage.setItem(keyName, JSON.stringify(value));
      } catch (e) {
        console.error(e);
      }
    },
    [keyName],
  );

  const getValue = useCallback((): T | null => {
    try {
      const item = window.localStorage.getItem(keyName);
      return item ? (JSON.parse(item) as T) : null;
    } catch (e) {
      console.error(e);
      return null;
    }
  }, [keyName]);

  return { getValue, setValue };
};
