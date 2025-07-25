import { Badge } from "@radix-ui/themes";
import type { FC } from "react";

export const ReadyToUnlockLabel: FC = () => {
  return (
    <Badge
      className="bg-[var(--alt-accent-3)] text-[var(--alt-accent-8)]"
      radius="large"
    >
      Ready to unlock
    </Badge>
  );
};
