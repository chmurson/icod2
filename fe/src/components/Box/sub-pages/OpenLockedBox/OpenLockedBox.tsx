import { useOpenLockedBoxCreationStore } from "@/stores/boxStore/openBoxCreationState";
import { Button } from "@/ui/Button";
import { Text } from "@/ui/Typography";
import { FieldArea } from "../../components/FieldArea";
import { ParticipantItem } from "../../components/ParticipantItem";

export const OpenLockedBox: React.FC = () => {
  const state = useOpenLockedBoxCreationStore();

  // Only show UI when in connecting/connected/opened state
  if (!["connecting", "connected", "opened"].includes(state.state)) {
    return <div>Loading...</div>;
  }

  const handleBackClick = () => {
    state.actions.reset();
  };

  return (
    <div className="flex flex-col gap-8">
      <Text variant="pageTitle" className="mt-4">
        Open a Locked Box
      </Text>
      <Text variant="secondaryText" className="mt-4">
        {`The timer starts when someone has ${state.keyThreshold} of ${state.onlineKeyHolders.length + state.offLineKeyHolders.length + 1} keys`}
      </Text>
      <div className="flex flex-col gap-4">
        <FieldArea label="Your access key">
          <ParticipantItem
            name={state.you.name}
            userAgent={state.you.userAgent}
          />
        </FieldArea>
        {state.onlineKeyHolders.length !== 0 && (
          <FieldArea label="Online users">
            <div className="flex flex-col gap-1.5">
              {state.onlineKeyHolders.map((p) => (
                <ParticipantItem
                  key={p.id}
                  name={p.name}
                  userAgent={p.userAgent}
                />
              ))}
            </div>
          </FieldArea>
        )}
        <FieldArea label="Offline users">
          <div className="flex flex-col gap-1.5">
            {state.offLineKeyHolders.length === 0 && (
              <Text variant="secondaryText">No offline keyholders.</Text>
            )}
            {state.offLineKeyHolders.map((p) => (
              <ParticipantItem
                key={p.id}
                name={p.name}
                userAgent={p.userAgent}
              />
            ))}
          </div>
        </FieldArea>
      </div>
      <div className="flex gap-4">
        <Button variant="secondary" onClick={handleBackClick}>
          Leave Lobby
        </Button>
      </div>
    </div>
  );
};
