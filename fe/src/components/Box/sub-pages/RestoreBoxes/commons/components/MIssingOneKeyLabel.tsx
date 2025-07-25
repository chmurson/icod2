import { Badge } from "@radix-ui/themes";
import type { FC } from "react";

export const MissingOneKeyLabel: FC = () => {
  return (
    <Badge variant="soft" radius="large">
      Missing 1 key
    </Badge>
  );
};
