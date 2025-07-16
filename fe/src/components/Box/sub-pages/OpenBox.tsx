import { useOpenBoxCreationState } from "@/stores/boxStore/openBoxCreationState";
import { Button } from "@/ui/Button";

export const OpenBox: React.FC = () => {
  const openBoxState = useOpenBoxCreationState();

  if (openBoxState.state === "connecting") {
    return <div>Loading...</div>;
  }

  const handleBackClick = () => {
    openBoxState.actions.reset();
  };

  return (
    <div>
      <div>Hello world</div>
      <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
        {JSON.stringify(openBoxState, null, 2)}
      </pre>
      <Button variant="secondary" onClick={handleBackClick}>
        Back
      </Button>
    </div>
  );
};
