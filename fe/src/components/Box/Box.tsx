import type React from "react";
import { useJoinBoxStore } from "@/stores";
import { useCreateBoxStore } from "@/stores/boxStore/createBoxStore";
import { CreateBox, JoinBox } from "./sub-pages/CreationBoxes";
import { DownloadLockedBox } from "./sub-pages/DownloadLockedBox";
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
      default:
        return <Welcome />;
    }
  };

  return renderCurrentPage();
};

const useCurrentPage = () => {
  const createBoxState = useCreateBoxStore((state) => state.state);
  const joinBoxState = useJoinBoxStore((state) => state.state);

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
