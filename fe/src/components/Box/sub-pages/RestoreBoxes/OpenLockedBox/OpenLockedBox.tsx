import { TextField } from "@radix-ui/themes";
import { type FC, useEffect, useMemo } from "react";
import { BoxErrorAlert } from "@/components/Box/components/BoxErrorAlert";
import { RelayReconnectingAlert } from "@/components/Box/components/RelayReconnectingAlert";
import { ShareAccessButton as ShareAccessButtonDumb } from "@/components/Box/components/ShareAccessButton";
import { ShareAccessDropdown as ShareAccessDropdownDumb } from "@/components/Box/components/ShareAccessDropdown";
import { ContentCard } from "@/components/layout/MainLayout";
import { useOpenLockedBoxStore } from "@/stores/boxStore";
import type { ParticipantType } from "@/stores/boxStore/common-types";
import ErrorBoundary from "@/ui/ErrorBoundry";
import { Alert, Button } from "@/ui/index";
import { FieldArea } from "../../../components/FieldArea";
import {
  LoobbyKeyHolders,
  ShareAccessKeysAvatars as ShareAccessKeysAvatarsDumb,
  TopLobbySection,
} from "../commons/components";
import { LeaveLobbyButton } from "../commons/components/LeaveLobbyButton";
import { NavigationAwayBlocker } from "../commons/components/NavigationAwayBlocker";
import { PageTitle } from "../commons/components/PageTitle";
import { persistStartedUnlocking } from "../commons/persistStartedUnlocking";
import { router } from "./dataChannelRouter";
import {
  useNavigateToShareableLink,
  useShareKeyWithParticipants,
} from "./hooks";
import { useInitiateCounter } from "./hooks/useInitiateCounter";
import { useOpenLockedBoxConnection } from "./useOpenLockedBoxConnection";
import { useSendMessageProto } from "./useSendMessageProto";

export const OpenLockedBox: FC = () => {
  const boxTitle = useOpenLockedBoxStore((state) => state.boxTitle);
  const { shareableURL, roomToken } = useNavigateToShareableLink();

  return (
    <>
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
        {roomToken && (
          <OpenLockedBoxContent
            shareableURL={shareableURL}
            roomToken={roomToken}
          />
        )}
      </ErrorBoundary>
    </>
  );
};

export const OpenLockedBoxContent: FC<{
  shareableURL: string;
  roomToken: string;
}> = ({ shareableURL, roomToken }) => {
  const {
    messageProto,
    routerMng,
    error,
    isRelayReconnecting,
    retryRoomRegistration,
  } = useOpenLockedBoxConnection();

  useEffect(() => {
    routerMng.addRouter("open-locked-box", router.router);

    return () => {
      routerMng.removeRouter("open-locked-box");
    };
  }, [routerMng]);

  const { sendKey } = useSendMessageProto({
    peerMessageProtoRef: messageProto.peerMessageProtoRef,
  });

  const state = useOpenLockedBoxStore((state) => state.state);

  const offLineKeyHolders = useOpenLockedBoxStore(
    (state) => state.offLineKeyHolders,
  );

  const onlineKeyHolders = useOpenLockedBoxStore(
    (state) => state.onlineKeyHolders,
  );

  const shareAccessKeyMapByKeyHolderId = useOpenLockedBoxStore(
    (state) => state.shareAccessKeyMapByKeyHolderId,
  );

  const keyThreshold = useOpenLockedBoxStore((state) => state.keyThreshold);

  const you = useOpenLockedBoxStore((state) => state.you);
  const actions = useOpenLockedBoxStore((state) => state.actions);

  useEffect(() => {
    if (roomToken) {
      persistStartedUnlocking(roomToken);
    }
  }, [roomToken]);

  useShareKeyWithParticipants(sendKey);

  useInitiateCounter({
    onStart: (date) => {
      actions.setUnlockingStartDate(date);
    },
    onStop: () => {
      actions.setUnlockingStartDate(null);
    },
  });

  const loadingStates = [
    "connecting",
    "connected",
    "ready-to-unlock",
  ] satisfies (typeof state)[];

  if (!(loadingStates as string[]).includes(state)) {
    return <div>Loading...</div>;
  }

  const possibleKeyHolders = [you, ...onlineKeyHolders, ...offLineKeyHolders];

  return (
    <div className="flex flex-col gap-8">
      {isRelayReconnecting && <RelayReconnectingAlert />}
      {error && (
        <BoxErrorAlert
          error={error}
          onRetryRoomRegistration={retryRoomRegistration}
        />
      )}
      <TopLobbySection useStoreHook={useOpenLockedBoxStore} />
      <div className="flex flex-col gap-4 py-4">
        {shareableURL && (
          <FieldArea label="Invite URL">
            <TextField.Root value={shareableURL} readOnly />
          </FieldArea>
        )}
        <LoobbyKeyHolders
          status={state}
          offLineKeyHolders={offLineKeyHolders}
          onlineKeyHolders={onlineKeyHolders}
          you={you}
          possibleKeyHolders={possibleKeyHolders}
          keyThreshold={keyThreshold}
          shareAccessKeyMapByKeyHolderId={shareAccessKeyMapByKeyHolderId}
          ShareAccesKeyAvatars={ShareAccesKeyAvatars}
          ShareAccessButton={ShareAccessButton}
          ShareAccessDropdown={ShareAccessDropdown}
        />
      </div>
      <ContentCard.OutsideSlot asChild>
        <LeaveLobbyButton useHookStore={useOpenLockedBoxStore} />
      </ContentCard.OutsideSlot>
      <NavigationAwayBlocker useHookStore={useOpenLockedBoxStore} isLeader />
    </div>
  );
};

const ShareAccesKeyAvatars: FC<{
  isYou?: boolean;
  keyHolderId: string;
  possibleKeyHolders: ParticipantType[];
}> = ({ keyHolderId, possibleKeyHolders, isYou = false }) => {
  const shareAccessKeyMapByKeyHolderId = useOpenLockedBoxStore(
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
  const shareAccessKeyByKeyHolderId = useOpenLockedBoxStore(
    (state) => state.shareAccessKeyByKeyHolderId,
  );
  const { toggleShareAccessKey } = useOpenLockedBoxStore(
    (state) => state.actions,
  );
  return (
    <ShareAccessButtonDumb
      shortText={shortText}
      checked={shareAccessKeyByKeyHolderId[keyHolderId] === true}
      onToggle={(checked) => toggleShareAccessKey(keyHolderId, checked)}
    />
  );
};

const ShareAccessDropdown: FC<{
  onlineKeyHolders: ParticipantType[];
  shortText?: boolean;
}> = ({ onlineKeyHolders, shortText }) => {
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
