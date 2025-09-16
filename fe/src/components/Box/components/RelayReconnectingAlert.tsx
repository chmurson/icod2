import { Spinner } from "@radix-ui/themes";
import { useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";

interface RelayReconnectingAlertProps
  extends React.HTMLAttributes<HTMLDivElement> {
  delay?: number;
  message?: string;
}

export const RelayReconnectingAlert = ({
  className,
  delay = 750,
  message = "Reconnecting to relay...",
  children,
  ...props
}: RelayReconnectingAlertProps) => {
  const [shouldRender, setShouldRender] = useState(false);
  const [isAnimatingIn, setIsAnimatingIn] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShouldRender(true);
      // Small delay to ensure element is in DOM before animation starts
      requestAnimationFrame(() => {
        setIsAnimatingIn(true);
      });
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  if (!shouldRender) {
    return null;
  }

  return (
    <div
      className={twMerge(
        "border rounded-lg p-4 flex gap-3 items-center",
        "border-amber-500 bg-amber-100/25 text-amber-700 dark:text-amber-500 dark:border-amber-500/75 dark:bg-amber-100/10",
        "transition-all duration-500 ease-in-out",
        isAnimatingIn
          ? "opacity-100 translate-y-0"
          : "opacity-0 -translate-y-2",
        className,
      )}
      {...props}
    >
      <Spinner size="3" />
      <div className="flex-1">
        <div className="text-sm font-medium">{children || message}</div>
      </div>
    </div>
  );
};
