import { useEffect, useState } from "react";
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
  "ready-to-unlock",
] satisfies UnlockingPageState[] as string[];

const LockedBox: React.FC = () => {
  const currentPage = useCurrentPage();

  const renderCurrentPage = () => {
    switch (currentPage) {
      case "drop":
        return <DropLockedBox />;
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
  const [currentPage, setCurrentPage] = useState<string | undefined>(undefined);

  const openLockedBoxState = useOpenLockedBoxStore((state) => state.state);
  const joinLockedBoxState = useJoinLockedBoxStore((state) => state.state);

  const resetOpenLockedBoxState = useOpenLockedBoxStore(
    (state) => state.actions.reset,
  );
  const resetJoinLockedBoxState = useJoinLockedBoxStore(
    (state) => state.actions.reset,
  );
  const joinLockedBoxError = useJoinLockedBoxStore((state) => state.error);

  useEffect(() => {
    if (lobbyStates.includes(joinLockedBoxState) && !joinLockedBoxError) {
      return setCurrentPage("join");
    }

    if (lobbyStates.includes(openLockedBoxState)) {
      return setCurrentPage("open");
    }

    setCurrentPage("drop");
  }, [joinLockedBoxState, joinLockedBoxError, openLockedBoxState]);

  useEffect(() => {
    resetJoinLockedBoxState();
    resetOpenLockedBoxState();
  }, [resetJoinLockedBoxState, resetOpenLockedBoxState]);

  return currentPage;
};

export default LockedBox;
