import { useEffect, useRef } from "react";

export function useDevExpAutoLockedBoxUpload({
  onAutoUpload,
  skip,
}: {
  onAutoUpload: (data: object) => void;
  skip?: boolean;
}) {
  const onAutoUploadRef = useRef(onAutoUpload);

  onAutoUploadRef.current = onAutoUpload;

  useEffect(() => {
    if (import.meta.env.DEV === true) {
      if (skip) {
        return () => {};
      }
      let timeoutHandler: number | undefined;
      const key = "ICOD2_DEBUG_INSTANT_LOCKED_BOX";
      const rawData = localStorage.getItem(key);

      if (!rawData) {
        return;
      }

      try {
        const maybeJson = JSON.parse(rawData);

        if (typeof maybeJson === "object") {
          timeoutHandler = window.setTimeout(() => {
            console.warn(
              `Loading locked box data from localStorage key: ${key}`,
            );
            onAutoUploadRef.current(maybeJson);
          }, 500);
        }
      } catch (_) {
        console.warn(`Failed to parse json from ${key}`);
      }

      return () => {
        window.clearTimeout(timeoutHandler);
      };
    }
    return () => {};
  }, [skip]);
}
