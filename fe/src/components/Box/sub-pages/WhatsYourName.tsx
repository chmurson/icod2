import { PersonIcon } from "@radix-ui/react-icons";
import { TextField } from "@radix-ui/themes";
import { useRef } from "react";
import { useCurrentUserAgent } from "@/hooks/useCurrentUserAgent";
import { usePersistInLocalStorage } from "@/hooks/usePersistInLocalStorage";
import { useCreateBoxStore, useJoinBoxStore } from "@/stores";
import { Button } from "@/ui/Button";
import { Text } from "@/ui/Typography";
import { UserAgent } from "../components/UserAgent";

export function WhatsYourName(
  props:
    | {
        create: true;
      }
    | { join: true },
) {
  const { getValue, setValue } = usePersistInLocalStorage<string>({
    keyName: "userName",
  });
  const refDefaultName = useRef<string | undefined>(getValue() ?? undefined);
  const refInput = useRef<HTMLInputElement>(null);
  const isCreate = "create" in props;
  const createBoxStoreActions = useCreateBoxStore((x) => x.actions);
  const joinBoxStoreActions = useJoinBoxStore((x) => x.actions);
  const currentUserAgent = useCurrentUserAgent();

  const handleBackClick = () => {
    if (isCreate) {
      createBoxStoreActions.reset();
    } else {
      joinBoxStoreActions.reset();
    }
  };

  const handleOkClick = () => {
    const name = refInput.current?.value.trim() ?? "";

    setValue(name);

    if (isCreate) {
      createBoxStoreActions.connect({ name, userAgent: currentUserAgent });
    } else {
      joinBoxStoreActions.connect({ name, userAgent: currentUserAgent });
    }
  };

  return (
    <div className="flex flex-col gap-6 items-start">
      <Text variant="pageTitle">
        {isCreate ? "Create a Box" : "Join a Box Creation"}
      </Text>
      <div className="flex gap-1 flex-col">
        <Text variant="label">Your name:</Text>
        <TextField.Root
          placeholder="..."
          className="min-w-72"
          ref={refInput}
          defaultValue={refDefaultName.current}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleOkClick();
            }
          }}
          autoFocus
        >
          <TextField.Slot>
            <PersonIcon height="16" width="16" />
          </TextField.Slot>
        </TextField.Root>
      </div>
      <div className="flex gap-1 flex-col">
        <Text variant="label">Your device</Text>
        <Text variant="primaryText">
          <UserAgent ua={currentUserAgent} />
        </Text>
      </div>
      <div className="flex gap-4">
        <Button variant="primary" onClick={handleOkClick}>
          Ok, Continue
        </Button>
        <Button variant="secondary" onClick={handleBackClick}>
          Back
        </Button>
      </div>
    </div>
  );
}
