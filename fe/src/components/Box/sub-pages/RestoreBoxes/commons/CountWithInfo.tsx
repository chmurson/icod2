import type React from "react";
import { Text } from "@/components/ui";

export const CountWithInfo = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-col items-center gap-1">
      <Text variant="pageTitle" className="text-7xl">
        02:00
      </Text>
      {children}
    </div>
  );
};
