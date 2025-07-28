import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useCreateBoxStore } from "@/stores";

export const useShareableURL = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const leaderId = useCreateBoxStore((state) => state.leader.id);

  useEffect(() => {
    const newURL = `/lock-box/${leaderId}`;
    if (newURL !== window.location.pathname) {
      navigate(newURL, { replace: true });
    }
  }, [leaderId, navigate]);

  return (sessionId?.trim() ?? "") === ""
    ? undefined
    : `${window.location.origin}/lock-box/${sessionId}`;
};
