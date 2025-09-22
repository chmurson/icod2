import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";

export const useShareablURLWithRoomToken = ({
  roomToken,
  url,
}: {
  roomToken: string;
  url: string;
}) => {
  const navigate = useNavigate();

  const newURL = useMemo(() => {
    return url.replace(":roomToken", roomToken);
  }, [roomToken, url]);

  useEffect(() => {
    if (newURL !== window.location.pathname) {
      navigate(newURL, { replace: true });
    }
  }, [navigate, newURL]);

  return `${window.location.origin}${newURL}`;
};
