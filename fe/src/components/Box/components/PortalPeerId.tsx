import { shortenPeerId } from "@icod2/protocols";
import { createPortal } from "react-dom";

export const PortalPeerId = ({
  peerId,
}: {
  peerId?: { toString(): string };
}) => {
  return (
    <>
      {createPortal(
        <p className="fixed bottom-0 right-1 text-xs py-0.5 px-1 bg-background-dark/15 dark:bg-background-light/15">
          Peer ID:{" "}
          <span className="font-mono">
            {shortenPeerId(peerId?.toString() ?? "")}
          </span>
        </p>,
        document.body,
      )}
    </>
  );
};
