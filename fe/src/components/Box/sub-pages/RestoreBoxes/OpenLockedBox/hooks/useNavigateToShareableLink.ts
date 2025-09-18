import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useRoomToken } from "@/services/libp2p/useRoomRegistration";

export const useNavigateToShareableLink = () => {
  const { roomToken } = useParams();
  const navigate = useNavigate();
  const { generateAndPersistRoomToken, roomTokenProvider } = useRoomToken();

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const token = await roomTokenProvider.getRoomToken();

      if (cancelled) {
        console.log("Cancelled");
        return;
      }

      if (!token) {
        const newToken = generateAndPersistRoomToken();
        navigate(`/unlock-box/${newToken}`, { replace: true });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [navigate, generateAndPersistRoomToken, roomTokenProvider]);

  const shareableURL = `${window.location.origin}/unlock-box/${roomToken}`;

  return {
    shareableURL,
    roomToken,
  };
};
