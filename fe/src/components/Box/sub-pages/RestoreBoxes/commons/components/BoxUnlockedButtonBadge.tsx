import { Badge } from "@radix-ui/themes";
import type { FC, PropsWithChildren } from "react";

export const AltProminentBadgeButton: FC<PropsWithChildren> = ({
  children,
}) => {
  return (
    <Badge className="bg-[var(--alt-accent-3)] text-[var(--alt-accent-8)] py-2 rounded-full px-6">
      {children}
    </Badge>
  );
};
