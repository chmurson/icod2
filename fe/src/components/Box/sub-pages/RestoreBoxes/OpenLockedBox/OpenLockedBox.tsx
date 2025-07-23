import { TextField } from "@radix-ui/themes";
import { useEffect } from "react";
import { ShareAccessButton } from "@/components/Box/components/ShareAccessButton";
import { ShareAccessDropdown } from "@/components/Box/components/ShareAccessDropdown";
import { useOpenLockedBoxStore } from "@/stores/boxStore";
import { Button } from "@/ui/Button";
import { Text } from "@/ui/Typography";
import { FieldArea } from "../../../components/FieldArea";
import { ParticipantItem } from "../../../components/ParticipantItem";
import { persistStartedUnlocking } from "../commons/persistStartedUnlocking";
import { useNavigateToShareableLink } from "./hooks";
import { useOpenLockedBoxConnection } from "./useOpenLockedBoxConnection";

export const OpenLockedBox: React.FC = () => {
  useOpenLockedBoxConnection();

  const { shareableURL, sessionId } = useNavigateToShareableLink();
  const state = useOpenLockedBoxStore((state) => state.state);

  const shareAccessKeyByKeyHolderId = useOpenLockedBoxStore(
    (state) => state.shareAccessKeyByKeyHolderId,
  );

  const offLineKeyHolders = useOpenLockedBoxStore(
    (state) => state.offLineKeyHolders,
  );

  const onlineKeyHolders = useOpenLockedBoxStore(
    (state) => state.onlineKeyHolders,
  );

  const keyThreshold = useOpenLockedBoxStore((state) => state.keyThreshold);
  const you = useOpenLockedBoxStore((state) => state.you);
  const actions = useOpenLockedBoxStore((state) => state.actions);

  useEffect(() => {
    if (sessionId) {
      persistStartedUnlocking(sessionId);
    }
  }, [sessionId]);

  if (!["connecting", "connected", "opened"].includes(state)) {
    return <div>Loading...</div>;
  }

  const handleBackClick = () => {
    actions.reset();
  };

  const idsOfKeyHoldersToShareWith = Object.entries(shareAccessKeyByKeyHolderId)
    .filter(([_, isSharing]) => isSharing)
    .map(([id]) => id);

  return (
    <div className="flex flex-col gap-8">
      <Text variant="pageTitle" className="mt-4">
        Open a Locked Box
      </Text>
      <Text variant="secondaryText" className="mt-4">
        {`The timer starts when someone has ${keyThreshold} of ${
          onlineKeyHolders.length + offLineKeyHolders.length + 1
        } keys`}
      </Text>
      <div className="flex flex-col gap-4">
        {shareableURL && (
          <FieldArea label="Invite URL">
            <TextField.Root value={shareableURL} readOnly />
          </FieldArea>
        )}
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
