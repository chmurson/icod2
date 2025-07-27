import type { FC } from "react";
import { Text } from "@/ui/Typography";

export const PageTitle: FC<{ boxTitle: string }> = ({
  boxTitle,
}: {
  boxTitle: string;
}) => {
  return (
    <div className="flex flex-col gap-1">
      <Text variant="pageTitle" className="mt-4">
        {boxTitle}
      </Text>
      <Text variant="label">
        Prepare to unlock what's been securely shared with you
      </Text>
    </div>
  );
};
