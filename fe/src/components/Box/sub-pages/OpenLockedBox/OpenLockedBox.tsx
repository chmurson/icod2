import { useOpenLockedBoxStore } from "@/stores/boxStore/openLockedBoxStore";
import { Button } from "@/ui/Button";
import { Text } from "@/ui/Typography";
import { FieldArea } from "../../components/FieldArea";
import { ParticipantItem } from "../../components/ParticipantItem";
import { ShareAccessButton } from "../../components/ShareAccessButton";

export const OpenLockedBox: React.FC = () => {
  const onlineKeyHolders = useOpenLockedBoxStore(
    (state) => state.onlineKeyHolders,
  );
  const offLineKeyHolders = useOpenLockedBoxStore(
    (state) => state.offLineKeyHolders,
  );
  const you = useOpenLockedBoxStore((state) => state.you);
  const keyTresholdId = useOpenLockedBoxStore((state) => state.keyThreshold);
  const storeState = useOpenLockedBoxStore((state) => state.state);
  const actions = useOpenLockedBoxStore((state) => state.actions);
  const shareAccessKeyByKeyHolderId = useOpenLockedBoxStore(
    (state) => state.shareAccessKeyByKeyHolderId,
  );

  // Only show UI when in connecting/connected/opened state
  if (!["connecting", "connected", "opened"].includes(storeState)) {
    return <div>Loading...</div>;
  }

  const handleBackClick = () => {
    actions.reset();
  };

  return (
    <div className="flex flex-col gap-8">
      <Text variant="pageTitle" className="mt-4">
        Open a Locked Box
      </Text>
      <Text variant="secondaryText" className="mt-4">
        {`The timer starts when someone has ${keyTresholdId} of ${onlineKeyHolders.length + offLineKeyHolders.length + 1} keys`}
      </Text>
      <div className="flex flex-col gap-4">
        <FieldArea label="Your access key">
          <ParticipantItem name={you.name} userAgent={you.userAgent} />
        </FieldArea>
        {onlineKeyHolders.length !== 0 && (
          <FieldArea label="Online users">
            <div className="flex flex-col gap-1.5">
              {onlineKeyHolders.map((p) => (
                <ParticipantItem
                  key={p.id}
                  name={p.name}
                  userAgent={p.userAgent}
                  buttonSlot={
                    <ShareAccessButton
                      checked={shareAccessKeyByKeyHolderId[p.id] === true}
                      onToggle={(checked) =>
                        actions.toggleShareAccessKey(p.id, checked)
                      }
                    />
                  }
                />
              ))}
            </div>
          </FieldArea>
        )}
        <FieldArea label="Offline users">
          <div className="flex flex-col gap-1.5">
            {offLineKeyHolders.length === 0 && (
              <Text variant="secondaryText">No offline keyholders.</Text>
            )}
            {offLineKeyHolders.map((p) => (
              <ParticipantItem
                key={p.id}
                name={p.name}
                userAgent={p.userAgent}
                buttonSlot={<ShareAccessButton checked={false} disabled />}
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
