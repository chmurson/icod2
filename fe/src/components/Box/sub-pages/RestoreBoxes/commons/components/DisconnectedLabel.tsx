import { Badge } from "@radix-ui/themes";
import type { FC } from "react";

export const DisconnectedLabel: FC = () => {
  return (
    <Badge color="red" radius="large">
      Disconnected
    </Badge>
  );
};
