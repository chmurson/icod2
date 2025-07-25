import type { FC } from "react";
import { Link } from "react-router-dom";
import type { StoreApi, UseBoundStore } from "zustand";
import type { LockedBoxStoreCommonPart } from "@/stores/boxStore/common-types";
import { Button } from "@/ui/Button";

type Props = {
  useHookStore: UseBoundStore<
    StoreApi<Pick<LockedBoxStoreCommonPart, "state" | "unlockingStartDate">>
  >;
};

export const LeaveLobbyButton: FC<Props> = ({ useHookStore }) => {
  const state = useHookStore((state) => state.state);
  const unlockingStartDate = useHookStore((state) => state.unlockingStartDate);

  return (
    <div className="flex justify-center mt-8">
      <Link to="/" style={{ textDecoration: "none" }}>
        <Button
          className="px-20"
          variant="alt-primary"
          disabled={unlockingStartDate !== null && state !== "ready-to-unlock"}
        >
          {state !== "ready-to-unlock" && "Leave Lobby"}
          {state === "ready-to-unlock" && "Back to home page"}
        </Button>
      </Link>
    </div>
  );
};
