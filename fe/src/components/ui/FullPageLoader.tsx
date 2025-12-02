import { type FC, useEffect, useRef } from "react";
import { Loader } from "./Loader";

let timeoutHandler: NodeJS.Timeout | undefined;

export const FullPageLoader: FC<{ message?: string }> = ({
  message = "Loading Stashcrate...",
}) => {
  const delayRef = useRef(globalDelayFromNow());

  useEffect(() => {
    clearTimeout(timeoutHandler);

    return () => {
      timeoutHandler = setTimeout(() => {
        window?.document
          ?.querySelector("#root")
          ?.setAttribute("data-loading-start-timestamp", "");
        console.log("Timeout cleared");
      }, 5000);
    };
  }, []);

  return <Loader message={message} fullPage fadeDelay={delayRef.current} />;
};

export default FullPageLoader;

function globalDelayFromNow() {
  const startTimestamp = window?.document
    ?.querySelector("#root")
    ?.getAttribute("data-loading-start-timestamp");

  console.log(startTimestamp, "XXX");

  if (!startTimestamp) {
    return 1500;
  }

  const nowTimestamp = Date.now();

  const diffInMs = nowTimestamp - Number(startTimestamp ?? 0);

  return 1500 - diffInMs;
}
