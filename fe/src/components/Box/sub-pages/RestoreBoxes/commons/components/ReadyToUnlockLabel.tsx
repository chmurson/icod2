import { Badge } from "@radix-ui/themes";
import type { FC } from "react";
import { Text } from "@/ui/Typography";

export const ReadyToUnlockLabel: FC = () => {
  return (
    <Badge color="grass" variant="soft" radius="large">
      Ready to unlock
    </Badge>
  );
};

<div
  className="px-2 py-1 rounded-md"
  style={{ backgroundColor: "var(--accent-9)" }}
>
  <Text variant="secondaryText" className="text-sm" />
</div>;
