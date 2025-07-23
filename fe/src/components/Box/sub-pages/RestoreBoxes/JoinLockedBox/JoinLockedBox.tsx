import { FieldArea } from "@/components/Box/components/FieldArea";
import { ParticipantItem } from "@/components/Box/components/ParticipantItem";
import { ShareAccessButton } from "@/components/Box/components/ShareAccessButton";
import { ShareAccessDropdown } from "@/components/Box/components/ShareAccessDropdown";
import { useJoinLockedBoxStore } from "@/stores/boxStore/joinLockedBoxStore";
import { Button } from "@/ui/Button";
import { Text } from "@/ui/Typography";
import { useJoinLockedBoxConnection } from "./useJoinLockedBoxConnection";

export const JoinLockedBox: React.FC = () => {
  const state = useJoinLockedBoxStore((state) => state.state);
  useJoinLockedBoxConnection();

  const onlineKeyHolders = useJoinLockedBoxStore(
    (state) => state.onlineKeyHolders,
  );

  const offLineKeyHolders = useJoinLockedBoxStore(
    (state) => state.offLineKeyHolders,
  );

  const you = useJoinLockedBoxStore((state) => state.you);
  const keyThreshold = useJoinLockedBoxStore((state) => state.keyThreshold);
  const actions = useJoinLockedBoxStore((state) => state.actions);
  const shareAccessKeyByKeyHolderId = useJoinLockedBoxStore(
    (state) => state.shareAccessKeyByKeyHolderId,
  );
  const shareAccessKeyMapByKeyHolderId = useJoinLockedBoxStore(
    (state) => state.shareAccessKeyMapByKeyHolderId,
  );

  const idsOfKeyHoldersToShareWith = Object.entries(shareAccessKeyByKeyHolderId)
    .filter(([_, value]) => value === true)
    .map(([key]) => key);

  // Only show UI when in connecting/connected/opened state
  if (!["connecting", "connected", "opened"].includes(state)) {
    return <div>Loading...</div>;
  }

  const handleBackClick = () => {
    actions.reset();
  };

  return (
    <div className="flex flex-col gap-8">
      <Text variant="pageTitle" className="mt-4">
        Join a Locked Box
      </Text>
      {JSON.stringify(shareAccessKeyMapByKeyHolderId, null, 2)}
      <Text variant="secondaryText" className="mt-4">
        {`The timer starts when someone has ${keyThreshold} of ${
          onlineKeyHolders.length + offLineKeyHolders.length + 1
        } keys`}
      </Text>
      <div className="flex flex-col gap-4">
        <FieldArea label="Your access key">
          <ParticipantItem
            name={you.name}
            userAgent={you.userAgent}
            buttonSlot={
              <ShareAccessDropdown
                value={idsOfKeyHoldersToShareWith}
                onChange={actions.toggleSharesAccessKeys}
                options={onlineKeyHolders.map((kh) => ({
                  id: kh.id,
                  name: kh.name,
                  userAgent: kh.userAgent,
                  avatar: undefined,
                }))}
              />
            }
          />
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
