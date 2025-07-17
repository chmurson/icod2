import type React from "react";
import { useJoinBoxStore } from "@/stores";
import { useOpenLockedBoxStore } from "@/stores/boxStore";
import { useCreateBoxStore } from "@/stores/boxStore/createBoxStore";
import { CreateBox, JoinBox } from "./sub-pages/CreationBoxes";
import { DownloadLockedBox } from "./sub-pages/DownloadLockedBox";
import { DropLockedBox } from "./sub-pages/DropLockedBox";
import { OpenLockedBox } from "./sub-pages/OpenLockedBox";
import Welcome from "./sub-pages/Welcome";
import { WhatsYourName } from "./sub-pages/WhatsYourName";

interface BoxProps {
  /**
   * Optional additional CSS classes to apply to the box.
   */
  className?: string;
}

const Box: React.FC<BoxProps> = () => {
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
      case "openBox":
        return <OpenLockedBox />;
      default:
        return <Welcome />;
    }
  };

  return renderCurrentPage();
};

const useCurrentPage = () => {
  const { state: createBoxState } = useCreateBoxStore();
  const { state: joinBoxState } = useJoinBoxStore();
  const { state: openBoxState } = useOpenLockedBoxStore();

  if (openBoxState === "drop-box") {
    return "dropBox";
  }

  if (openBoxState === "connecting") {
    return "openBox";
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
