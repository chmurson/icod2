import { TextField } from "@radix-ui/themes";
import { type FC, useEffect, useMemo } from "react";
import { ShareAccessButton as ShareAccessButtonDumb } from "@/components/Box/components/ShareAccessButton";
import { ShareAccessDropdown as ShareAccessDropdownDumb } from "@/components/Box/components/ShareAccessDropdown";
import { useOpenLockedBoxStore } from "@/stores/boxStore";
import type { ParticipantType } from "@/stores/boxStore/common-types";
import { Button } from "@/ui/Button";
import { Text } from "@/ui/Typography";
import { FieldArea } from "../../../components/FieldArea";
import { ParticipantItem } from "../../../components/ParticipantItem";
import { ShareAccessKeysAvatars as ShareAccessKeysAvatarsDumb } from "../commons/components";
import { persistStartedUnlocking } from "../commons/persistStartedUnlocking";
import { useNavigateToShareableLink } from "./hooks";
import { useOpenLockedBoxConnection } from "./useOpenLockedBoxConnection";

export const OpenLockedBox: React.FC = () => {
  useOpenLockedBoxConnection();
  const { shareableURL, sessionId } = useNavigateToShareableLink();
  const state = useOpenLockedBoxStore((state) => state.state);

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

  const possibleKeyHolders = [you, ...onlineKeyHolders, ...offLineKeyHolders];

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
            sharedKeysSlot={
              <ShareAccesKeyAvatars
                keyHolderId={you.id}
                possibleKeyHolders={possibleKeyHolders}
              />
            }
            buttonSlot={
              <ShareAccessDropdown onlineKeyHolders={onlineKeyHolders} />
            }
          />
        </FieldArea>
        {onlineKeyHolders.length !== 0 && (
          <FieldArea label="Online users">
            <div className="flex flex-col gap-1.5">
              {onlineKeyHolders.map((kh) => (
                <ParticipantItem
                  key={kh.id}
                  name={kh.name}
                  userAgent={kh.userAgent}
                  sharedKeysSlot={
                    <ShareAccesKeyAvatars
                      keyHolderId={kh.id}
                      possibleKeyHolders={possibleKeyHolders}
                    />
                  }
                  buttonSlot={<ShareAccessButton keyHolderId={kh.id} />}
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
            {offLineKeyHolders.map((kh) => (
              <ParticipantItem
                key={kh.id}
                name={kh.name}
                userAgent={kh.userAgent}
                sharedKeysSlot={
                  <ShareAccesKeyAvatars
                    keyHolderId={kh.id}
                    possibleKeyHolders={possibleKeyHolders}
                  />
                }
                buttonSlot={<ShareAccessButtonDumb checked={false} disabled />}
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

const ShareAccesKeyAvatars: FC<{
  keyHolderId: string;
  possibleKeyHolders: ParticipantType[];
}> = ({ keyHolderId, possibleKeyHolders }) => {
  const shareAccessKeyMapByKeyHolderId = useOpenLockedBoxStore(
    (state) => state.shareAccessKeyMapByKeyholderId,
  );

  const keyholdersSharingTheirKeys = useMemo(() => {
    return Object.entries(shareAccessKeyMapByKeyHolderId)
      .map(([sharingKeyHolderId, withWhoMap]) => {
        return withWhoMap[keyHolderId] === true
          ? sharingKeyHolderId
          : undefined;
      })
      .filter((x) => x !== undefined);
  }, [shareAccessKeyMapByKeyHolderId, keyHolderId]);

  return (
    <ShareAccessKeysAvatarsDumb
      keyHolderId={keyHolderId}
      keyholdersSharingTheirKeys={keyholdersSharingTheirKeys}
      possibleKeyHolders={possibleKeyHolders}
    />
  );
};

const ShareAccessButton = ({ keyHolderId }: { keyHolderId: string }) => {
  const shareAccessKeyByKeyHolderId = useOpenLockedBoxStore(
    (state) => state.shareAccessKeyByKeyHolderId,
  );
  const { toggleShareAccessKey } = useOpenLockedBoxStore(
    (state) => state.actions,
  );
  return (
    <ShareAccessButtonDumb
      checked={shareAccessKeyByKeyHolderId[keyHolderId] === true}
      onToggle={(checked) => toggleShareAccessKey(keyHolderId, checked)}
    />
  );
};

const ShareAccessDropdown: FC<{
  onlineKeyHolders: ParticipantType[];
}> = ({ onlineKeyHolders }) => {
  const shareAccessKeyByKeyHolderId = useOpenLockedBoxStore(
    (state) => state.shareAccessKeyByKeyHolderId,
  );
  const { toggleSharesAccessKeys } = useOpenLockedBoxStore(
    (state) => state.actions,
  );
  const idsOfKeyHoldersToShareWith = Object.entries(shareAccessKeyByKeyHolderId)
    .filter(([_, isSharing]) => isSharing)
    .map(([id]) => id);

  return (
    <ShareAccessDropdownDumb
      value={idsOfKeyHoldersToShareWith}
      onChange={toggleSharesAccessKeys}
      options={onlineKeyHolders.map((kh) => ({
        id: kh.id,
        name: kh.name,
        userAgent: kh.userAgent,
        avatar: undefined,
      }))}
    />
  );
};
