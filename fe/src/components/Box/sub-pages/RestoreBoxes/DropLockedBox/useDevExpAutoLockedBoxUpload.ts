import { logger } from "@icod2/protocols";
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
    if (import.meta.env.DEV !== true) {
      return () => {};
    }

    if (skip) {
      return () => {};
    }
    let timeoutHandler: number;
    const data = window.icod2Dev.lockedBoxAutoLoad.get();

    if (typeof data === "object") {
      timeoutHandler = window.setTimeout(() => {
        logger.warn("Loading locked box data from localStorage");
        onAutoUploadRef.current(data);
      }, 1000);
    }

    return () => {
      window.clearTimeout(timeoutHandler);
    };
  }, [skip]);
}
