import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  clearPersistedRoomToken,
  isPersistedRoomToken,
} from "@/services/libp2p/useRoomRegistration";
import {
  useCreateBoxStore,
  useDownloadBoxStore,
  useJoinBoxStore,
} from "@/stores";
import { CreateBox } from "./CreateBox";
import { CreateBoxConnectionProvider } from "./CreateBoxConnectionProvider";
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
      case "download-create":
        return (
          <CreateBoxConnectionProvider>
            {currentPage === "create" && <CreateBox />}
            {currentPage === "download-create" && <DownloadLockedBox />}
          </CreateBoxConnectionProvider>
        );
      case "join":
        return <JoinBox />;
      case "download-join":
        return <DownloadLockedBox />;
      default:
        return null;
    }
  };

  return renderCurrentPage();
};

const useCurrentPage = () => {
  const { roomToken } = useParams();
  const createBoxState = useCreateBoxStore((state) => state.state);
  const joinBoxState = useJoinBoxStore((state) => state.state);
  const downloadStateType = useDownloadBoxStore((state) => state.type);

  const isInitialized = useInitialization();

  useEffect(() => {
    if (!isPersistedRoomToken(roomToken ?? "")) {
      clearPersistedRoomToken();
    }
  }, [roomToken]);

  if (!isInitialized) {
    return null;
  }

  if (downloadStateType === "fromJoinBox") {
    return "download-join";
  }
  if (downloadStateType === "fromCreateBox") {
    return "download-create";
  }

  if (createBoxState === "initial" && joinBoxState === "initial") {
    const emptyRoomToken = (roomToken?.trim() ?? "") === "";
    return emptyRoomToken || isPersistedRoomToken(roomToken ?? "")
      ? "createBoxSetName"
      : "joinBoxSetName";
  }

  if (createBoxState === "set-name") {
    return "createBoxSetName";
  }

  if (
    createBoxState === "connected" ||
    createBoxState === "connecting" ||
    createBoxState === "creating" ||
    createBoxState === "created"
  ) {
    return "create";
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
  const resetDownloadStore = useDownloadBoxStore((state) => state.reset);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    setIsInitialized((currentIsInitialized) => {
      if (!currentIsInitialized) {
        createBoxActions.reset();
        joinBoxActions.reset();
        resetDownloadStore();
      }

      return true;
    });
  }, [createBoxActions, joinBoxActions, resetDownloadStore]);

  useEffect(() => {
    return () => {
      createBoxActions.reset();
      joinBoxActions.reset();
      resetDownloadStore();
    };
  }, [createBoxActions.reset, joinBoxActions.reset, resetDownloadStore]);

  return isInitialized;
};
