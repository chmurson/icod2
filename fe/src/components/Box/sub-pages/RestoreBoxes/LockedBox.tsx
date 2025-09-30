import { useEffect, useMemo, useState } from "react";
import { useOpenLockedBoxStore } from "@/stores/boxStore";
import { useJoinLockedBoxStore } from "@/stores/boxStore/joinLockedBoxStore";
import { DropLockedBox } from "./DropLockedBox/DropLockedBox";
import { JoinLockedBox } from "./JoinLockedBox/JoinLockedBox";
import { OpenLockedBox } from "./OpenLockedBox/OpenLockedBox";

type UnlockingPageState = ReturnType<
  (typeof useOpenLockedBoxStore)["getState"]
>["state"];

const lobbyStates = [
  "connecting",
  "connected",
  "disconnected",
  "ready-to-unlock",
] satisfies UnlockingPageState[] as string[];

const LockedBox: React.FC = () => {
  const currentPage = useCurrentPage();

  const renderCurrentPage = () => {
    switch (currentPage) {
      case "open":
        return <OpenLockedBox />;
      case "join":
        return <JoinLockedBox />;
      default:
        return <DropLockedBox />;
    }
  };

  return renderCurrentPage();
};

const useCurrentPage = () => {
  const [isMounted, setIsMounted] = useState(false);
  const openLockedBoxState = useOpenLockedBoxStore((state) => state.state);
  const joinLockedBoxState = useJoinLockedBoxStore((state) => state.state);

  const resetOpenLockedBoxState = useOpenLockedBoxStore(
    (state) => state.actions.reset,
  );
  const resetJoinLockedBoxState = useJoinLockedBoxStore(
    (state) => state.actions.reset,
  );
  const joinLockedBoxError = useJoinLockedBoxStore((state) => state.error);

  const currentPage = useMemo(() => {
    if (
      isMounted &&
      lobbyStates.includes(joinLockedBoxState) &&
      !joinLockedBoxError
    ) {
      return "join";
    }

    if (isMounted && lobbyStates.includes(openLockedBoxState)) {
      return "open";
    }

    return "drop";
  }, [joinLockedBoxState, joinLockedBoxError, openLockedBoxState, isMounted]);

  useEffect(() => {
    resetJoinLockedBoxState();
    resetOpenLockedBoxState();
    setIsMounted(true);
  }, [resetJoinLockedBoxState, resetOpenLockedBoxState]);

  return currentPage;
};

export default LockedBox;
