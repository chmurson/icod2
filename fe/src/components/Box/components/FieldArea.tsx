import type { FC, PropsWithChildren, ReactNode } from "react";
import { Text } from "@/ui/Typography";

export const FieldArea: FC<PropsWithChildren<{ label: ReactNode }>> = ({
  label,
  children,
}) => {
  return (
    <div className="flex gap-1 flex-col">
      <Text variant="label">{label}</Text>
      {children}
    </div>
  );
};
