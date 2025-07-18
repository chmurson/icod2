import { useEffect, useState } from "react";
import { useOpenLockedBoxStore } from "@/stores/boxStore/openLockedBoxStore";
import { Button } from "@/ui/Button";
import { Text } from "@/ui/Typography";
import { FieldArea } from "../../../components/FieldArea";
import { ParticipantItem } from "../../../components/ParticipantItem";

export const OpenLockedBox: React.FC = () => {
  const state = useOpenLockedBoxStore();
  const [copied, setCopied] = useState(false);

  const sessionUrl = `${window.location.origin}/${state.keyHolderId}`;

  useEffect(
    () => {
      if (
        ["connecting", "connected", "opened"].includes(state.state) &&
        state.keyHolderId
      ) {
        navigator.clipboard.writeText(sessionUrl).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        });
      }
    },
    [state.state, state.keyHolderId, sessionUrl],
    sessionUrl,
  );

  if (!["connecting", "connected", "opened"].includes(state.state)) {
    return <div>Loading...</div>;
  }

  const handleBackClick = () => {
    state.actions.reset();
  };

  return (
    <div className="flex flex-col gap-8">
      {copied && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 text-white px-6 py-2 rounded shadow-lg transition-opacity duration-300">
          Session URL copied to clipboard!
        </div>
      )}
      <Text variant="pageTitle" className="mt-4">
        Open a Locked Box
      </Text>
      <Text variant="secondaryText" className="mt-4">
        {`The timer starts when someone has ${state.keyThreshold} of ${state.onlineKeyHolders.length + state.offLineKeyHolders.length + 1} keys`}
      </Text>
      <div className="flex flex-col gap-4">
        <FieldArea label="Your access key">
          <ParticipantItem
            name={state.you.name}
            userAgent={state.you.userAgent}
          />
        </FieldArea>
        {state.onlineKeyHolders.length !== 0 && (
          <FieldArea label="Online users">
            <div className="flex flex-col gap-1.5">
              {state.onlineKeyHolders.map((p) => (
                <ParticipantItem
                  key={p.id}
                  name={p.name}
                  userAgent={p.userAgent}
                />
              ))}
            </div>
          </FieldArea>
        )}
        <FieldArea label="Offline users">
          <div className="flex flex-col gap-1.5">
            {state.offLineKeyHolders.length === 0 && (
              <Text variant="secondaryText">No offline keyholders.</Text>
            )}
            {state.offLineKeyHolders.map((p) => (
              <ParticipantItem
                key={p.id}
                name={p.name}
                userAgent={p.userAgent}
              />
            ))}
          </div>
        </FieldArea>
      </div>
      <div className="flex gap-4">
        <Button variant="secondary" onClick={handleBackClick}>
          Leave Lobby
        </Button>
      </div>
    </div>
  );
};
