import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useOpenLockedBoxStore } from "@/stores/boxStore";
import { useJoinLockedBoxStore } from "@/stores/boxStore/joinLockedBoxStore";
import { DropLockedBox } from "./DropLockedBox/DropLockedBox";
import { JoinLockedBox } from "./JoinLockedBox/JoinLockedBox";
import { OpenLockedBox } from "./OpenLockedBox/OpenLockedBox";

const LockedBox: React.FC = () => {
  const { keyHolderId } = useParams();
  console.log(keyHolderId);
  const _navigate = useNavigate();
  const startJoinLockedBox = useJoinLockedBoxStore(
    (state) => state.actions.start,
  );
  useEffect(() => {
    if (keyHolderId) {
      console.log("started");
      startJoinLockedBox();
    }
  }, [keyHolderId, startJoinLockedBox]);

  console.log(useJoinLockedBoxStore().state);
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
  const openLockedBoxState = useOpenLockedBoxStore((state) => state.state);
  const joinLockedBoxState = useJoinLockedBoxStore((state) => state.state);

  if (joinLockedBoxState === "connecting") {
    return "join";
  }

  if (openLockedBoxState === "connecting") {
    return "open";
  }

  return "drop";
};

export default LockedBox;
