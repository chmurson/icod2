import type React from "react";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useJoinBoxStore } from "@/stores";
import { useOpenLockedBoxStore } from "@/stores/boxStore";
import { useCreateBoxStore } from "@/stores/boxStore/createBoxStore";
import { useJoinLockedBoxStore } from "@/stores/boxStore/joinLockedBoxStore";
import { useStoreLeaderId } from "@/stores/boxStore/storeLeaderId";
import { CreateBox, JoinBox } from "./sub-pages/CreationBoxes";
import { DownloadLockedBox } from "./sub-pages/DownloadLockedBox";
import { DropLockedBox } from "./sub-pages/RestoreBoxes/DropLockedBox/DropLockedBox";
import { JoinLockedBox } from "./sub-pages/RestoreBoxes/JoinLockedBox";
import { OpenLockedBox } from "./sub-pages/RestoreBoxes/OpenLockedBox";
import Welcome from "./sub-pages/Welcome";
import { WhatsYourName } from "./sub-pages/WhatsYourName";

interface BoxProps {
  /**
   * Optional additional CSS classes to apply to the box.
   */
  className?: string;
}

const Box: React.FC<BoxProps> = () => {
  const { keyHolderId } = useParams();
  const navigate = useNavigate();
  const startJoinLockedBoxStore = useJoinLockedBoxStore();

  const setLeaderId = useStoreLeaderId((s) => s.setLeaderId);

  useEffect(() => {
    if (keyHolderId) {
      setLeaderId(keyHolderId);
      startJoinLockedBoxStore.actions.start();
      navigate("/", { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    keyHolderId,
    navigate,
    setLeaderId,
    startJoinLockedBoxStore.actions.start,
  ]);

  const currentPage = useCurrentPage();

  const renderCurrentPage = () => {
    switch (currentPage) {
      case "createBoxSetName":
        return <WhatsYourName create />;
      case "joinBoxSetName":
        return <WhatsYourName join />;
      case "welcome":
        return <Welcome />;
      case "create":
        return <CreateBox />;
      case "join":
        return <JoinBox />;
      case "download":
        return <DownloadLockedBox />;
      case "dropBox":
        return <DropLockedBox />;
      case "openLockedBox":
        return <OpenLockedBox />;
      case "joinLockedBox":
        return <JoinLockedBox />;
      default:
        return <Welcome />;
    }
  };

  return renderCurrentPage();
};

const useCurrentPage = () => {
  const createBoxState = useCreateBoxStore((state) => state.state);
  const joinBoxState = useJoinBoxStore((state) => state.state);
  const openLockedBoxState = useOpenLockedBoxStore((state) => state.state);
  const joinLockedBoxState = useJoinLockedBoxStore((state) => state.state);

  if (openLockedBoxState === "drop-box" || joinLockedBoxState === "drop-box") {
    return "dropBox";
  }

  if (openLockedBoxState === "connecting") {
    return "openLockedBox";
  }

  if (joinLockedBoxState === "connecting") {
    return "joinLockedBox";
  }

  if (createBoxState === "set-name") {
    return "createBoxSetName";
  }

  if (createBoxState === "connected" || createBoxState === "connecting") {
    return "create";
  }

  if (createBoxState === "created" || joinBoxState === "created") {
    return "download";
  }

  if (joinBoxState === "set-name") {
    return "joinBoxSetName";
  }

  if (joinBoxState === "connecting" || joinBoxState === "connected") {
    return "join";
  }

  return "welcome";
};

export default Box;
