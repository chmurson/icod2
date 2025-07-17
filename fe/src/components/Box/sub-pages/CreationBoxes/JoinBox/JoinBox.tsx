import { TextArea } from "@radix-ui/themes";
import type React from "react";
import { useJoinBoxStore } from "@/stores";
import { Button } from "@/ui/Button";
import { Text } from "@/ui/Typography";
import { FieldArea } from "../../../components/FieldArea";
import { ParticipantItem } from "../../../components/ParticipantItem";
import { useJoinBoxConnection } from "./useJoinBoxConnection";

// Singleton for the session
export const JoinBox: React.FC = () => {
  const { leader, otherKeyholders, threshold, title, you, content } =
    useStoreSlice();
  const actions = useJoinBoxStore((state) => state.actions);

  useJoinBoxConnection();

  return (
    <div className="flex flex-col gap-8">
      <Text variant="pageTitle" className="mt-4">
        Join a Box Creation
      </Text>
      {!leader?.id && (
        <div className="flex flex-col items-start gap-4">
          <Text variant="primaryError">No leader connected</Text>
          <Button variant="primary" onClick={actions.reset}>
            Go back
          </Button>
        </div>
      )}
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
    </div>
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
  content: string;
}) => {
  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex gap-2 items-center">
          <Text variant="label">Name:</Text>
          <Text variant="primaryText">{title}</Text>
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
              <Text variant="secondaryText">
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
        {content !== "" && (
          <FieldArea label="Content:">
            <TextArea disabled rows={6} value={content} className="w-full" />
          </FieldArea>
        )}
      </div>
      <Text variant="primaryText">
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

  return {
    title,
    leader,
    you,
    threshold,
    otherKeyholders,
    content,
  };
};

export default JoinBox;
