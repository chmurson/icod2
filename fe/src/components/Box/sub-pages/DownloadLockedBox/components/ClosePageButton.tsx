import { Button } from "@/ui/Button";

export const ClosePageButton = ({ onClose }: { onClose: () => void }) => {
  return (
    <Button variant="secondary" onClick={onClose}>
      Close page
    </Button>
  );
};
