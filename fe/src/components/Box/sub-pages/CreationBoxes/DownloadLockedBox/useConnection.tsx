import { useContext, useEffect, useRef } from "react";
import { createBoxConnectionContext } from "../CreateBoxConnectionProvider";
import { router } from "./dataChannelRouter";

export function useConnection() {
  const context = useContext(createBoxConnectionContext);

  const timeoutRef = useRef<number>(undefined);

  useEffect(() => {
    if (!!context?.addRouter && !!context?.removeRouter) {
      context.addRouter("download-box-router", router);

      timeoutRef.current = window.setTimeout(() => {
        context.dataChannelMngRef.current?.close();
        context.dataChannelMngRef.current = undefined;
      }, 20 * 1000 /* 20 secs */);

      return () => {
        window.clearTimeout(timeoutRef.current);
        context.removeRouter("download-box-router");
      };
    }

    return () => {};
  }, [context?.addRouter, context?.removeRouter, context?.dataChannelMngRef]);
}
