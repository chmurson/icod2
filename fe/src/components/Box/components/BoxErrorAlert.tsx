import type { ConnectionErrors } from "@/services/libp2p/peer-connection-handler";
import type { Libp2pServiceErrors } from "@/services/libp2p/useLibp2p/useLibp2p";
import type { RoomRegistrationErrors } from "@/services/libp2p/useRoomRegistration";
import { Alert } from "@/ui/Alert";
import { Button } from "@/ui/Button";

type PossibleErrors =
  | RoomRegistrationErrors
  | Libp2pServiceErrors
  | ConnectionErrors;

type Props = {
  error?: PossibleErrors;
  onRetryRoomRegistration?: () => void;
};

export function BoxErrorAlert(props: Props) {
  const { error, onRetryRoomRegistration } = props;

  if (!error) {
    return null;
  }

  const errorMessages: Record<Exclude<PossibleErrors, undefined>, string> = {
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
          <span>{errorMessages[error] ?? "Unexpeted error"}</span>
          {error === "room-registration-timeout" && (
            <Button
              onClick={onRetryRoomRegistration}
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
