import { useCallback, useRef } from "react";
import type { RouterItem } from "./types";

export function useRouterManager<BasicMessagePayload extends object, TProto>() {
  const routersRef = useRef<
    Map<string, RouterItem<BasicMessagePayload, TProto>>
  >(new Map());

  const addRouter = useCallback(
    (id: string, routerToAdd: RouterItem<BasicMessagePayload, TProto>) => {
      if (routersRef.current.has(id)) {
        console.warn(`Router with id "${id}" already exists. Replacing it.`);
      }

      routersRef.current.set(id, routerToAdd);
    },
    [],
  );

  const removeRouter = useCallback((id: string) => {
    const deleted = routersRef.current.delete(id);
    if (!deleted) {
      console.warn(`Router with id "${id}" not found.`);
    }
    return deleted;
  }, []);

  const getRouterIds = useCallback(() => {
    return Array.from(routersRef.current.keys());
  }, []);

  const hasRouter = useCallback((id: string) => {
    return routersRef.current.has(id);
  }, []);

  const clearRouters = useCallback(() => {
    routersRef.current.clear();
  }, []);

  const combinedRouter = useRef(
    (localID: string, data: BasicMessagePayload, proto: TProto) => {
      const routers = Array.from(routersRef.current.values());

      for (const [id, routerItem] of routers.entries()) {
        try {
          routerItem(localID, data, proto);
        } catch (error) {
          console.error(`Error in router ${id}:`, error);
        }
      }
    },
  );

  return {
    currentCombinedRouter: combinedRouter.current,
    addRouter,
    removeRouter,
    getRouterIds,
    hasRouter,
    clearRouters,
  };
}
