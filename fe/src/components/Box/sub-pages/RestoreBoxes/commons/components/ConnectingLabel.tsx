import { Badge } from "@radix-ui/themes";
import type { FC } from "react";

export const ConnectingLabel: FC = () => {
  return (
    <Badge color="gold" radius="large">
      Connecting...
    </Badge>
  );
};
