import { TextArea } from "@radix-ui/themes";
import type React from "react";
import { FiEye } from "react-icons/fi";
import { ContentCard } from "@/components/layout";
import { useJoinBoxStore } from "@/stores";
import { Alert } from "@/ui/Alert";
import { Button } from "@/ui/Button";
import ErrorBoundary from "@/ui/ErrorBoundry";
import {
  NavigateAwayAlert,
  useNavigateAwayBlocker,
} from "@/ui/NavigateAwayAlert";
import { Text } from "@/ui/Typography";
import { FieldArea } from "../../../components/FieldArea";
import { ParticipantItem } from "../../../components/ParticipantItem";
import { LeaveLobbyButton } from "../commons/components";
import { BoxJoinContentForOKSkeleton } from "./BoxJoinContentForOKSkeleton";
import { useConnectionTimeout } from "./useConnectionTimeout";
import { useJoinBoxConnection } from "./useJoinBoxConnection";

export const JoinBox: React.FC = () => {
  return (
    <div className="flex flex-col gap-8">
      <Text variant="pageTitle" className="mt-4">
        Join a Box Creation
      </Text>
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
        <JoinBoxContent />
      </ErrorBoundary>
    </div>
  );
};

const JoinBoxContent = () => {
  const {
    leader,
    otherKeyholders,
    threshold,
    title,
    you,
    content,
    connectionToLeaderFailReason,
  } = useStoreSlice();
  useJoinBoxConnection();
  useConnectionTimeout();

  const blocker = useNavigateAwayBlocker({
    shouldNavigationBeBlocked: () => !connectionToLeaderFailReason,
  });

  const getConnectionErrorMessage = (reason: string) => {
    switch (reason) {
      case "timeout":
        return "Connection timed out. Please try again.";
      case "not-authorized":
        return "You are not authorized to join this session.";
      default:
        return "Cannot connect to a leader";
    }
  };

  return (
    <>
      {!leader?.id && connectionToLeaderFailReason && (
        <div className="flex flex-col items-start gap-4">
          <Alert variant="warning" className="self-stretch">
            {getConnectionErrorMessage(connectionToLeaderFailReason)}
          </Alert>
        </div>
      )}
      {!leader?.id && <BoxJoinContentForOKSkeleton you={you} />}
      {!!leader?.id && (
        <BoxJoinContentForOK
          leader={leader}
          otherKeyholders={otherKeyholders}
          threshold={threshold}
          title={title}
          you={you}
          content={content}
        />
      )}
      <NavigateAwayAlert
        open={blocker.state === "blocked"}
        textTitle="Are you sure you want to leave?"
        textDescription="You are currently connected as a follower in the box locking session, which is still ongoing. If you leave now, you will be disconnected and may lose your opportunity to participate in the process."
        onGoBack={() => blocker.proceed?.()}
        onClose={() => blocker.reset?.()}
      />
      <ContentCard.OutsideSlot asChild>
        <LeaveLobbyButton>Leave lobby</LeaveLobbyButton>
      </ContentCard.OutsideSlot>
    </>
  );
};

const BoxJoinContentForOK = ({
  leader,
  threshold,
  title,
  you,
  otherKeyholders,
  content,
}: {
  title: string;
  threshold: number;
  otherKeyholders: { id: string; name: string; userAgent: string }[];
  leader: { name: string; userAgent: string };
  you: { name: string; userAgent: string };
  content?: string;
}) => {
  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex gap-2 items-center">
          <Text variant="label">Name:</Text>
          <Text variant={title.trim() ? "primaryText" : "secondaryText"}>
            {title.trim() || "No name set"}
          </Text>
        </div>
        <div className="flex gap-2 items-center">
          <Text variant="label">Key Treshold:</Text>
          <Text variant="primaryText">{threshold}</Text>
        </div>
        <FieldArea label="Leader:">
          <ParticipantItem name={leader.name} userAgent={leader.userAgent} />
        </FieldArea>
        <FieldArea label="You:">
          <ParticipantItem name={you.name} userAgent={you.userAgent} />
        </FieldArea>
        <FieldArea label="Other keyholders: ">
          <div className="flex flex-col gap-1.5">
            {otherKeyholders.length === 0 && (
              <Text variant="secondaryText" className="text-sm">
                No keyholders yet. Waiting for others to join...
              </Text>
            )}
            {otherKeyholders.map((p) => (
              <ParticipantItem
                key={p.id}
                name={p.name}
                userAgent={p.userAgent}
              />
            ))}
          </div>
        </FieldArea>
        {content !== undefined && (
          <FieldArea label="Content:">
            <TextArea disabled rows={6} value={content} className="w-full" />
            <Text
              variant="secondaryText"
              className="inline-flex items-center gap-2 text-xs"
            >
              <FiEye />
              Leaders shares content preview with you
            </Text>
          </FieldArea>
        )}
      </div>
      <Text variant="primaryText" className="text-sm">
        Waiting for more keyholders, or leader to create finalize box creation.
      </Text>
    </>
  );
};

const useStoreSlice = () => {
  const title = useJoinBoxStore((state) => state.title);
  const leader = useJoinBoxStore((state) => state.leader);
  const you = useJoinBoxStore((state) => state.you);
  const threshold = useJoinBoxStore((state) => state.threshold);
  const otherKeyholders = useJoinBoxStore((state) => state.otherKeyHolders);
  const content = useJoinBoxStore((state) => state.content);
  const connectionToLeaderFailReason = useJoinBoxStore(
    (state) => state.connectionToLeaderFailReason,
  );

  return {
    title,
    leader,
    you,
    threshold,
    otherKeyholders,
    content,
    connectionToLeaderFailReason,
  };
};

export default JoinBox;
