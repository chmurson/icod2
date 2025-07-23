import { type FC, useMemo } from "react";
import { ShareAccessButton as ShareAccessButtonDumb } from "@/components/Box/components/ShareAccessButton";
import { ShareAccessDropdown as ShareAccessDropdownDumb } from "@/components/Box/components/ShareAccessDropdown";
import type { ParticipantType } from "@/stores/boxStore/common-types";
import { useJoinLockedBoxStore } from "@/stores/boxStore/joinLockedBoxStore";
import { Button } from "@/ui/Button";
import { Text } from "@/ui/Typography";
import {
  LoobbyKeyHolders,
  ShareAccessKeysAvatars as ShareAccessKeysAvatarsDumb,
} from "../commons/components";
import { CounterWithInfo } from "../commons/components/CounterWithInfo";
import { useJoinLockedBoxConnection } from "./useJoinLockedBoxConnection";

export const JoinLockedBox: React.FC = () => {
  const state = useJoinLockedBoxStore((state) => state.state);
  useJoinLockedBoxConnection();

  const unlockingStartDate = useJoinLockedBoxStore(
    (state) => state.unlockingStartDate,
  );
  const onlineKeyHolders = useJoinLockedBoxStore(
    (state) => state.onlineKeyHolders,
  );

  const offLineKeyHolders = useJoinLockedBoxStore(
    (state) => state.offLineKeyHolders,
  );

  const you = useJoinLockedBoxStore((state) => state.you);
  const keyThreshold = useJoinLockedBoxStore((state) => state.keyThreshold);
  const actions = useJoinLockedBoxStore((state) => state.actions);

  // Only show UI when in connecting/connected/opened state
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
        Join a Locked Box
      </Text>
      <CounterWithInfo
        unlockingStartDate={unlockingStartDate}
        keyThreshold={keyThreshold}
        onlineKeyHoldersCount={
          onlineKeyHolders.length + offLineKeyHolders.length + 1
        }
      />
      <LoobbyKeyHolders
        offLineKeyHolders={offLineKeyHolders}
        onlineKeyHolders={onlineKeyHolders}
        possibleKeyHolders={possibleKeyHolders}
        you={you}
        ShareAccesKeyAvatars={ShareAccesKeyAvatars}
        ShareAccessButton={ShareAccessButton}
        ShareAccessDropdown={ShareAccessDropdown}
      />
      <div className="flex gap-4">
        <Button
          variant="secondary"
          onClick={handleBackClick}
          disabled={unlockingStartDate !== null}
        >
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
  const shareAccessKeyMapByKeyHolderId = useJoinLockedBoxStore(
    (state) => state.shareAccessKeyMapByKeyHolderId,
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
  const shareAccessKeyByKeyHolderId = useJoinLockedBoxStore(
    (state) => state.shareAccessKeyByKeyHolderId,
  );
  const { toggleShareAccessKey } = useJoinLockedBoxStore(
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
  const shareAccessKeyByKeyHolderId = useJoinLockedBoxStore(
    (state) => state.shareAccessKeyByKeyHolderId,
  );
  const { toggleSharesAccessKeys } = useJoinLockedBoxStore(
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
