import customLogger from "@icod2/protocols/src/commons/customLogger";
import { useContext, useEffect, useRef } from "react";
import { createBoxConnectionContext } from "../CreateBoxConnectionProvider";
import { router } from "./dataChannelRouter";

const TIMEOUT_MS = 20 * 1000; // 20 secs

export function useConnection() {
  const context = useContext(createBoxConnectionContext);

  const timeoutRef = useRef<number>(undefined);

  useEffect(() => {
    if (context?.routerMng) {
      context.routerMng.addRouter("download-box-router", router.router);

      timeoutRef.current = window.setTimeout(() => {
        customLogger.warn(
          "Download locked box connection timed out - but the timeout is not really implemented",
        );
      }, TIMEOUT_MS);

      return () => {
        window.clearTimeout(timeoutRef.current);
        context.routerMng.removeRouter("download-box-router");
      };
    }

    return () => {};
  }, [context?.routerMng]);
}
