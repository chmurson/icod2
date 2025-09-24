import { type RefObject, useRef } from "react";
import { PeerIdKeyholderMap } from "./usePeerIdToKeyholderId";

/*
 * Global peer-to-keyholder mapping state management.
 *
 * This module maintains a global state for mapping peer IDs to keyholder IDs.
 * While the state is kept globally, this should be acceptable since there will
 * only be one page at a time that uses this functionality. Additionally, our
 * coexisting Zustand state is also global, maintaining consistency in our
 * state management approach.
 *
 * Note: Ideally, the lifecycle of this state should be highly bound with the
 * dataChannelManager, but this integration has been left for later implementation
 * to allow for faster development progress.
 */
const peerToKeyHolderMap = new PeerIdKeyholderMap();

interface UsePeerToHolderMapRef {
  getValue: () => PeerIdKeyholderMap;
  (): { peerToKeyHolderMapRef: RefObject<PeerIdKeyholderMap> };
}

/**
 * Can be used in two ways:
 *
 * 1. As a normal React hook within components:
 *    ```typescript
 *    const { peerToKeyHolderMapRef } = usePeerToHolderMapRef();
 *    // Access the map via peerToKeyHolderMapRef.current
 *    ```
 *
 * 2. As an instance function outside of React components:
 *    ```typescript
 *    const currentMap = usePeerToHolderMapRef.getValue();
 *    // Direct access to the current map instance
 *    ```
 *
 * The instance function is useful for accessing the map in router handlers,
 * utility functions, or other non-component contexts where hooks cannot be used.
 */
export const usePeerToHolderMapRef: UsePeerToHolderMapRef = (() => {
  const fn = () => {
    const peerToKeyHolderMapRef = useRef(peerToKeyHolderMap);

    return {
      peerToKeyHolderMapRef,
    };
  };

  fn.getValue = () => peerToKeyHolderMap;

  return fn;
})();

if (import.meta.env.DEV) {
  //@ts-expect-error
  window.peerIdKeyholderMap = usePeerToHolderMapRef;
}
