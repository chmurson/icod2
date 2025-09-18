import { type FC, useMemo } from "react";
import { ShareAccessButton as ShareAccessButtonDumb } from "@/components/Box/components/ShareAccessButton";
import { ShareAccessDropdown as ShareAccessDropdownDumb } from "@/components/Box/components/ShareAccessDropdown";
import { ContentCard } from "@/components/layout/MainLayout";
import type { ParticipantType } from "@/stores/boxStore/common-types";
import { useJoinLockedBoxStore } from "@/stores/boxStore/joinLockedBoxStore";
import { Alert } from "@/ui/Alert";
import ErrorBoundary from "@/ui/ErrorBoundry";
import { Button } from "@/ui/index";
import {
  LoobbyKeyHolders,
  ShareAccessKeysAvatars as ShareAccessKeysAvatarsDumb,
  TopLobbySection,
} from "../commons/components";
import { LeaveLobbyButton } from "../commons/components/LeaveLobbyButton";
import { NavigationAwayBlocker } from "../commons/components/NavigationAwayBlocker";
import { PageTitle } from "../commons/components/PageTitle";
import { useDataChannelSendMessages } from "./dataChannelSendMessages";
import { useSendKeyToLeader } from "./hooks";
import { useJoinLockedBoxConnection } from "./useJoinLockedBoxConnection";

export const JoinLockedBox: FC = () => {
  const boxTitle = useJoinLockedBoxStore((state) => state.boxTitle);
  return (
    <div className="flex flex-col gap-8">
      <PageTitle boxTitle={boxTitle} />
      <ErrorBoundary
        fallback={({ handleRetry, isRetrying }) => (
          <div className="flex flex-col gap-4">
            <Alert variant="error">Something went wrong</Alert>
            <Button
              variant="primary"
              onClick={handleRetry}
              className="self-start"
              loading={isRetrying}
            >
              Try to connect again
            </Button>
          </div>
        )}
      >
        <JoinLockedBoxContent />
      </ErrorBoundary>
    </div>
  );
};

const JoinLockedBoxContent: React.FC = () => {
  const state = useJoinLockedBoxStore((state) => state.state);
  const connectionToLeaderFailReason = useJoinLockedBoxStore(
    (state) => state.connectionToLeaderFailReason,
  );
  const { peerMessageProtoRef } = useJoinLockedBoxConnection();

  const { sendKey } = useDataChannelSendMessages({
    peerMessageProtoRef,
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

  const getConnectionErrorMessage = (
    reason: typeof connectionToLeaderFailReason,
  ) => {
    switch (reason) {
      case "timeout":
        return "Connection timed out. Please try again.";
      case "not-authorized":
        return "You are not authorized to join this session.";
      case "peer-connection-failed":
        return "Connection between you and peer has failed, sorry.";
      default:
        return "Cannot connect to a leader";
    }
  };
  return (
    <div className="flex flex-col gap-8">
      {connectionToLeaderFailReason && (
        <div className="flex flex-col items-start gap-4">
          <Alert variant="warning" className="self-stretch">
            {getConnectionErrorMessage(connectionToLeaderFailReason)}
          </Alert>
        </div>
      )}
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
  isYou?: boolean;
  keyHolderId: string;
  possibleKeyHolders: ParticipantType[];
}> = ({ keyHolderId, possibleKeyHolders, isYou = false }) => {
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
      isYou={isYou}
      keyHolderId={keyHolderId}
      keyholdersSharingTheirKeys={keyholdersSharingTheirKeys}
      possibleKeyHolders={possibleKeyHolders}
    />
  );
};

const ShareAccessButton = ({
  keyHolderId,
  shortText,
}: {
  keyHolderId: string;
  shortText?: boolean;
}) => {
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
      shortText={shortText}
    />
  );
};

const ShareAccessDropdown: FC<{
  onlineKeyHolders: ParticipantType[];
  shortText?: boolean;
}> = ({ onlineKeyHolders, shortText }) => {
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
      shortText={shortText}
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
