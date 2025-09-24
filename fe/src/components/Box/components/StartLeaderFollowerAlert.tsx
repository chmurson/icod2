import type { FC, ReactNode } from "react";
import { Link } from "react-router-dom";
import { Alert } from "@/ui/Alert";
import { Button } from "@/ui/Button";
import { cn } from "@/utils/cn";

type Props = {
  type: "leader" | "follower";
  leaderAlertContent: ReactNode;
  followerAlertContent: ReactNode;
  followerNavigateButtonText: string;
  followerNavigateToLink: string;
  className?: string;
};

export const StartLeaderFollowerAlert: FC<Props> = ({
  followerAlertContent,
  type,
  leaderAlertContent,
  followerNavigateToLink,
  followerNavigateButtonText,
  className,
}) => {
  return (
    <>
      {type === "follower" && (
        <div className={cn("flex flex-col gap-4", className)}>
          <Alert variant="info">
            <div className="flex justify-between max-sm:flex-col gap-2">
              <span>{followerAlertContent}</span>
              <Link to={followerNavigateToLink} className="no-underline">
                <Button
                  variant="secondary"
                  className="self-end text-sm whitespace-nowrap"
                  size="1"
                >
                  {followerNavigateButtonText}
                </Button>
              </Link>
            </div>
          </Alert>
          <div className="flex flex-col gap-1" />
        </div>
      )}
      {type === "leader" && (
        <Alert variant="info" className={className}>
          {leaderAlertContent}
        </Alert>
      )}
    </>
  );
};
