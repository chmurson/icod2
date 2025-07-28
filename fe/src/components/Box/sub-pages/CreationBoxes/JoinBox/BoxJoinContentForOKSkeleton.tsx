import { Skeleton } from "@radix-ui/themes";
import { Text } from "@/ui/Typography";
import { FieldArea } from "../../../components/FieldArea";

const ParticipantItemSkeleton = () => (
  <div className="flex items-center gap-3">
    <Skeleton loading>
      <div className="w-8 h-8 rounded-full bg-gray-200" />
    </Skeleton>
    <div className="flex flex-col gap-1">
      <Skeleton loading>
        <Text variant="primaryText">John Doe</Text>
      </Skeleton>
      <Skeleton loading>
        <Text variant="secondaryText" className="text-xs">
          Chrome on Windows
        </Text>
      </Skeleton>
    </div>
  </div>
);

export const BoxJoinContentForOKSkeleton = () => {
  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex gap-2 items-center">
          <Text variant="label">Name:</Text>
          <Skeleton loading>
            <Text variant="primaryText">Sample Box Name</Text>
          </Skeleton>
        </div>
        <div className="flex gap-2 items-center">
          <Text variant="label">Key Treshold:</Text>
          <Skeleton loading>
            <Text variant="primaryText">3</Text>
          </Skeleton>
        </div>
        <FieldArea label="Leader:">
          <ParticipantItemSkeleton />
        </FieldArea>
        <FieldArea label="You:">
          <ParticipantItemSkeleton />
        </FieldArea>
        <FieldArea label="Other keyholders: ">
          <div className="flex flex-col gap-1.5">
            <ParticipantItemSkeleton />
            <ParticipantItemSkeleton />
          </div>
        </FieldArea>
      </div>
      <Skeleton loading>
        <Text variant="primaryText" className="text-sm">
          Waiting for more keyholders, or leader to create finalize box
          creation.
        </Text>
      </Skeleton>
    </>
  );
};
