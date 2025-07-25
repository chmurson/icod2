import { type FC, useMemo } from "react";
import { ShareAccessButton as ShareAccessButtonDumb } from "@/components/Box/components/ShareAccessButton";
import { ShareAccessDropdown as ShareAccessDropdownDumb } from "@/components/Box/components/ShareAccessDropdown";
import { ContentCard } from "@/components/layout/MainLayout";
import type { ParticipantType } from "@/stores/boxStore/common-types";
import { useJoinLockedBoxStore } from "@/stores/boxStore/joinLockedBoxStore";
import { Text } from "@/ui/Typography";
import {
  LoobbyKeyHolders,
  ShareAccessKeysAvatars as ShareAccessKeysAvatarsDumb,
  TopLobbySection,
} from "../commons/components";
import { LeaveLobbyButton } from "../commons/components/LeaveLobbyButton";
import { NavigationAwayBlocker } from "../commons/components/NavigationAwayBlocker";
import { useDataChannelSendMessages } from "./dataChannelSendMessages";
import { useSendKeyToLeader } from "./hooks";
import { useJoinLockedBoxConnection } from "./useJoinLockedBoxConnection";

export const JoinLockedBox: React.FC = () => {
  const state = useJoinLockedBoxStore((state) => state.state);
  const { dataChannelManagerRef } = useJoinLockedBoxConnection();

  const { sendKey } = useDataChannelSendMessages({
    dataChannelManagerRef,
  });

  const onlineKeyHolders = useJoinLockedBoxStore(
    (state) => state.onlineKeyHolders,
  );

  const offLineKeyHolders = useJoinLockedBoxStore(
    (state) => state.offLineKeyHolders,
  );

  const keyThreshold = useJoinLockedBoxStore((state) => state.keyThreshold);

  const you = useJoinLockedBoxStore((state) => state.you);

  const shareAccessKeyMapByKeyHolderId = useJoinLockedBoxStore(
    (state) => state.shareAccessKeyMapByKeyHolderId,
  );

  const loadingStates = [
    "connecting",
    "connected",
    "ready-to-unlock",
  ] satisfies (typeof state)[];

  useSendKeyToLeader(sendKey);

  if (!(loadingStates as string[]).includes(state)) {
    return <div>Loading...</div>;
  }

  const possibleKeyHolders = [you, ...onlineKeyHolders, ...offLineKeyHolders];

  return (
    <div className="flex flex-col gap-8 py-4">
      <Text variant="pageTitle" className="mt-4">
        Join a Locked Box
      </Text>

      <TopLobbySection useStoreHook={useJoinLockedBoxStore} />
      <LoobbyKeyHolders
        status={state}
        offLineKeyHolders={offLineKeyHolders}
        onlineKeyHolders={onlineKeyHolders}
        possibleKeyHolders={possibleKeyHolders}
        you={you}
        shareAccessKeyMapByKeyHolderId={shareAccessKeyMapByKeyHolderId}
        keyThreshold={keyThreshold}
        ShareAccesKeyAvatars={ShareAccesKeyAvatars}
        ShareAccessButton={ShareAccessButton}
        ShareAccessDropdown={ShareAccessDropdown}
      />
      <ContentCard.OutsideSlot asChild>
        <LeaveLobbyButton useHookStore={useJoinLockedBoxStore} />
      </ContentCard.OutsideSlot>
      <NavigationAwayBlocker useHookStore={useJoinLockedBoxStore} />
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
