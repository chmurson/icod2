import { Box } from "@radix-ui/themes";
import type React from "react";
import { useJoinBoxCreationState } from "@/stores";
import { Button } from "@/ui/Button";

const JoinBoxDownload: React.FC = () => {
  const state = useJoinBoxCreationState();

  const handleDownload = () => {
    if (state.encryptedMessage) {
      const blob = new Blob([state.encryptedMessage], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "encrypted-message.txt";
      a.click();
      URL.revokeObjectURL(url);
    }
    if (state.generatedKey) {
      const blob = new Blob([state.generatedKey], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "key-shard.txt";
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div>
      <h1>Hi I'm Join Box Download page</h1>
      <Box>
        <div className="flex gap-4">
          {state.encryptedMessage && state.generatedKey && (
            <Button variant="primary" onClick={handleDownload}>
              Download message and key shard
            </Button>
          )}
        </div>
      </Box>
      <PrettyJson>{state}</PrettyJson>
    </div>
  );
};

const PrettyJson: React.FC<{ children: object }> = ({ children }) => {
  return (
    <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
      {JSON.stringify(children, null, 2)}
    </pre>
  );
};

export default JoinBoxDownload;
