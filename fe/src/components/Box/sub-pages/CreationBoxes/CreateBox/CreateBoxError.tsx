import { Alert } from "@/ui/Alert";
import { Button } from "@/ui/Button";
import { useCreateBoxConnectionContext } from "../CreateBoxConnectionProvider";

export function CreateBoxError() {
  const context = useCreateBoxConnectionContext();

  if (!context.error) {
    return null;
  }

  const errorMessages: Record<
    Exclude<(typeof context)["error"], undefined>,
    string
  > = {
    "room-registration-invalid-state": "Invalid state for room registration",
    "room-registration-timeout": "Timeout occurred while registering room",
    "room-registration-unknown-error":
      "An unknown error occurred while registering room",
    EmptyBootstrapMultiaddrsError: "Empty bootstrap multiaddrs",
    Libp2pServiceError: "Libp2p service error",
    RoomTokenProviderError: "Room token provider error",
    CannotConnectToRelayPeer: "Cannot connect to relay peer",
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <Alert variant="warning" className="self-stretch items-center">
        <div className="flex justify-between items-center">
          <span>{errorMessages[context.error] ?? "Unexpeted error"}</span>
          {context.error === "room-registration-timeout" && (
            <Button
              onClick={() => context.retyRoomRegistartion()}
              variant="primary"
              size="1"
            >
              Retry
            </Button>
          )}
        </div>
      </Alert>
    </div>
  );
}
