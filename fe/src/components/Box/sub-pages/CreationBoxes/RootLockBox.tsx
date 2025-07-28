import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useCreateBoxStore, useJoinBoxStore } from "@/stores";
import { CreateBox } from "./CreateBox";
import {
  clearPersistedStartedLockingInfo,
  isPersistedStartedLocking,
} from "./commons";
import { DownloadLockedBox } from "./DownloadLockedBox";
import { JoinBox } from "./JoinBox";
import { WhatsYourName } from "./WhatsYourName";

export const RootLockBox = () => {
  const currentPage = useCurrentPage();

  const renderCurrentPage = () => {
    switch (currentPage) {
      case "createBoxSetName":
        return <WhatsYourName create />;
      case "joinBoxSetName":
        return <WhatsYourName join />;
      case "create":
        return <CreateBox />;
      case "join":
        return <JoinBox />;
      case "download":
        return <DownloadLockedBox />;
      default:
        return null;
    }
  };

  return renderCurrentPage();
};

const useCurrentPage = () => {
  const { sessionId } = useParams();
  const createBoxState = useCreateBoxStore((state) => state.state);
  const joinBoxState = useJoinBoxStore((state) => state.state);

  const isInitialized = useInitialization();

  useEffect(() => {
    if (!isPersistedStartedLocking(sessionId ?? "")) {
      clearPersistedStartedLockingInfo();
    }
  }, [sessionId]);

  if (!isInitialized) {
    return null;
  }

  if (createBoxState === "initial" && joinBoxState === "initial") {
    return (sessionId?.trim() ?? "") === "" ||
      isPersistedStartedLocking(sessionId ?? "")
      ? "createBoxSetName"
      : "joinBoxSetName";
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

const useInitialization = () => {
  const createBoxActions = useCreateBoxStore((state) => state.actions);
  const joinBoxActions = useJoinBoxStore((state) => state.actions);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    setIsInitialized((currentIsInitialized) => {
      if (!currentIsInitialized) {
        createBoxActions.reset();
        joinBoxActions.reset();
      }

      return true;
    });
  }, [createBoxActions, joinBoxActions]);

  return isInitialized;
};
