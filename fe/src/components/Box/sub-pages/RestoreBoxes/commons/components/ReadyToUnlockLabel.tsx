import { Badge } from "@radix-ui/themes";
import type { FC } from "react";

export const ReadyToUnlockLabel: FC = () => {
  return (
    <Badge color="grass" variant="soft" radius="large">
      Ready to unlock
    </Badge>
  );
};
