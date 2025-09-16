import { loggerGate } from "@icod2/protocols";
import { useRef } from "react";
import type { DataChannelMessageRouter } from "./DataChannelMessageRouter";

export type RouterFunction = (
  localID: string,
  data: object,
  dataChannelManager: unknown,
) => void;

export type RouterItem = {
  id: string;
  router:
    | RouterFunction
    // biome-ignore lint/suspicious/noExplicitAny: REFACTOR TEMPORARY
    | DataChannelMessageRouter<any, any>;
};

export function useRouter() {
  const routersRef = useRef<Map<string, RouterItem>>(new Map());

  // Combined router function that calls all registered routers
  // @ts-expect-error
  // biome-ignore lint/correctness/noUnusedVariables: FOR NOW
  const combinedRouter = useCallback(
    // biome-ignore lint/suspicious/noExplicitAny: REFACTOR REPLACE LATER
    (localID: string, data: object, dataChannelManager: any) => {
      const routers = Array.from(routersRef.current.values());

      for (const routerItem of routers) {
        try {
          if (typeof routerItem.router === "function") {
            routerItem.router(localID, data, dataChannelManager);
          } else {
            // It's a DataChannelMessageRouter instance
            routerItem.router.router(localID, data, dataChannelManager);
          }
        } catch (error) {
          loggerGate.canError &&
            console.error(`Error in router ${routerItem.id}:`, error);
        }
      }
    },
    [],
  );
}
