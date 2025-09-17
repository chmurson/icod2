import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useCreateBoxStore } from "@/stores";
import { isPersistedRoomToken } from "../../commons";

export const useShareableURL = () => {
  const { roomToken } = useParams();
  const navigate = useNavigate();

  const roomTokenFromStore = useCreateBoxStore((state) => state.roomToken);

  useEffect(() => {
    const newURL = `/lock-box/${roomTokenFromStore}`;
    if (newURL !== window.location.pathname) {
      navigate(newURL, { replace: true });
      isPersistedRoomToken(roomTokenFromStore);
    }
  }, [roomTokenFromStore, navigate]);

  const isEmptyRoomToken = (roomToken?.trim() ?? "") === "";

  return isEmptyRoomToken
    ? ""
    : `${window.location.origin}/lock-box/${roomToken}`;
};
