import { Alert } from "@/ui/Alert";
import type { JoinBoxConnectionError } from "./useJoinBoxConnection";

export function JoinBoxError({ error }: { error: JoinBoxConnectionError }) {
  if (!error) {
    return null;
  }

  const errorMessages: Record<
    Exclude<JoinBoxConnectionError, undefined>,
    string
  > = {
    EmptyBootstrapMultiaddrsError: "Empty bootstrap multiaddrs",
    Libp2pServiceError: "Libp2p service error",
    RoomTokenProviderError: "Room token provider error",
    CannotConnectToRelayPeer: "Cannot connect to relay peer",
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <Alert variant="warning" className="self-stretch items-center">
        <div className="flex justify-between items-center">
          <span>{errorMessages[error] ?? "Unexpeted error"}</span>
        </div>
      </Alert>
    </div>
  );
}
