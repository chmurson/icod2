import type { Subset } from "@/utils/types";
import type { ConnectionErrors } from "../core/peer-connection-handler";

export type IgnoredErrors = Subset<
  ConnectionErrors,
  "CannotConnectToRelayPeer"
>;

export const ignoredErrors: IgnoredErrors[] = ["CannotConnectToRelayPeer"];

export const isIgnoredErrors = (error: unknown): error is IgnoredErrors => {
  return ignoredErrors.includes(error as IgnoredErrors);
};
