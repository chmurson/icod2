import { AlertDialog } from "@radix-ui/themes";
import { type ReactNode, useEffect, useRef } from "react";
import { useBlocker } from "react-router-dom";
import { Button } from "@/ui/Button";
import { useTailwindBreakpoints } from "@/utils/useTailwindBreakpoints";

export const NavigateAwayAlert = ({
  triggerSlot,
  onGoBack,
  open,
  onClose,
  textCancelButton = "Upps, cancel",
  textDescription = "Are you sure you want to leave? You might loose your changes.",
  textProceedButton = "Ignore the alert and close the page",
  textTitle = "You may loose your data",
}: {
  triggerSlot?: ReactNode;
  onGoBack: () => void;
  onClose?: () => void;
  open?: boolean;
  textTitle?: string;
  textDescription?: string;
  textCancelButton?: string;
  textProceedButton?: string;
}) => {
  const { isMaxSm } = useTailwindBreakpoints();
  return (
    <AlertDialog.Root open={open}>
      {triggerSlot && <AlertDialog.Trigger>{triggerSlot}</AlertDialog.Trigger>}
      <AlertDialog.Content maxWidth={isMaxSm ? "390px" : "500px"}>
        <AlertDialog.Title as="h2">{textTitle}</AlertDialog.Title>
        <AlertDialog.Description size="2">
          {textDescription}
        </AlertDialog.Description>
        <div className="flex justify-between mt-4 max-sm:flex-col max-sm:items-stretch gap-2">
          <AlertDialog.Cancel>
            <Button variant="primary" onClick={onClose}>
              {textCancelButton}
            </Button>
          </AlertDialog.Cancel>
          <AlertDialog.Action>
            <Button variant="secondary" onClick={onGoBack}>
              {textProceedButton}
            </Button>
          </AlertDialog.Action>
        </div>
      </AlertDialog.Content>
    </AlertDialog.Root>
  );
};

export const useNavigateAwayBlocker = ({
  shouldNavigationBeBlocked,
}: {
  shouldNavigationBeBlocked: () => boolean;
}) => {
  const shouldNavigationBeBlockedRef = useRef(shouldNavigationBeBlocked);
  shouldNavigationBeBlockedRef.current = shouldNavigationBeBlocked;
  const blocker = useBlocker(shouldNavigationBeBlocked);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (shouldNavigationBeBlockedRef.current()) {
        event.preventDefault();
        event.returnValue = ""; // Required for browser to show prompt
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  return blocker;
};
