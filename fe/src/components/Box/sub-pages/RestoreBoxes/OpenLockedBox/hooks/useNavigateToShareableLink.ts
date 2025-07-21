import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useOpenLockedBoxStore } from "@/stores/boxStore";

export const useNavigateToShareableLink = () => {
  const params = useParams();
  const navigate = useNavigate();

  const keyHolderId = useOpenLockedBoxStore((state) => state.keyHolderId);

  useEffect(() => {
    if (params.sessionId !== keyHolderId) {
      navigate(`/unlock-box/${keyHolderId}`, { replace: true });
    }
  }, [params.sessionId, navigate, keyHolderId]);

  const shareableURL = `${window.location.origin}/unlock-box/${keyHolderId}`;

  return {
    shareableURL,
    sessionId: params.sessionId,
  };
};
