import { Button, Dialog, TextArea } from "@radix-ui/themes";
import type { FC } from "react";
import { lazy, Suspense, useState } from "react";
import { Alert } from "@/ui/Alert";
import { cn } from "@/utils/cn";
import { AlternateProminentButton } from "./AlternateProminentButton";
import tokenSvg from "./assets/token.svg";

const MessageDecryptor = lazy(() =>
  import("./MessageDecryptor").then((module) => ({
    default: module.MessageDecryptor,
  })),
);

const DecryptorFallback: FC = () => (
  <TextArea
    value={String("*").repeat(500)}
    readOnly
    className="w-full"
    rows={12}
  />
);

type Props = {
  keys: string[];
  encryptedMessage: string;
  disabled?: boolean;
  className?: string;
};

export const OpenBoxButton: FC<Props> = ({
  encryptedMessage,
  keys,
  disabled = false,
  className,
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <Dialog.Root open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <Dialog.Trigger>
        <AlternateProminentButton
          className={cn("self-center", className)}
          disabled={disabled}
        >
          <img alt="box" src={tokenSvg} width={18} height={18} />
          Open Box
        </AlternateProminentButton>
      </Dialog.Trigger>

      <Dialog.Content style={{ maxWidth: 450 }}>
        <Dialog.Title as="h2">Box Contents</Dialog.Title>
        <Dialog.Description size="2" mb="4">
          This is contents of the box:
        </Dialog.Description>
        <div className="mb-8">
          <Suspense fallback={<DecryptorFallback />}>
            <MessageDecryptor keys={keys} encryptedMessage={encryptedMessage}>
              {({ decryptedMessage, error }) => (
                <>
                  {decryptedMessage && (
                    <TextArea
                      value={decryptedMessage}
                      readOnly
                      className="w-full"
                      rows={12}
                    />
                  )}
                  {!decryptedMessage && !error && <DecryptorFallback />}
                  {error && (
                    <Alert variant="error">Something went wrong :(</Alert>
                  )}
                </>
              )}
            </MessageDecryptor>
          </Suspense>
        </div>

        <Dialog.Close>
          <Button variant="soft" color="gray">
            Close
          </Button>
        </Dialog.Close>
      </Dialog.Content>
    </Dialog.Root>
  );
};
