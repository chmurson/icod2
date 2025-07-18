import { DownloadIcon, PlusIcon, StarIcon } from "@radix-ui/react-icons";
import { Alert } from "./ui";
import { Button } from "./ui/Button";
import { Text } from "./ui/Typography";

function ComponentsDemo() {
  return (
    <div style={{ padding: 24 }}>
      <h1>Components Demo</h1>
      <p>This page will showcase various UI components.</p>
      {/* Components will be added here */}
      <Buttons addIcon={false} />
      <Buttons addIcon={true} />

      <div className="mt-18 space-y-2">
        <Text variant="pageTitle">Page title</Text>
        <Text variant="sectionTitle">Section title</Text>
        <Text variant="primaryText">Primary text</Text>
        <Text variant="label">Label</Text>
        <Text variant="secondaryText">Secondary text</Text>
      </div>
      <div className="mt-18 flex flex-col gap-4">
        <Alert variant="info">Lorem ipsum...</Alert>
        <Alert variant="warning">Lorem ipsum...</Alert>
        <Alert variant="error">Lorem ipsum...</Alert>
      </div>
    </div>
  );
}

const Buttons = ({ addIcon }: { addIcon: boolean }) => {
  return (
    <div className="flex">
      <div className="flex flex-col gap-12 p-8">
        <div>Active</div>
        <div>Loading</div>
        <div>Disabled</div>
      </div>
      <div className="space-y-8 p-8">
        <div className="flex gap-8">
          <Button variant="prominent" iconSlot={addIcon ? <PlusIcon /> : null}>
            Prominent button
          </Button>
          <Button
            variant="primary"
            iconSlot={addIcon ? <DownloadIcon /> : null}
          >
            Primary button
          </Button>
          <Button variant="secondary" iconSlot={addIcon ? <StarIcon /> : null}>
            Secondary button
          </Button>
        </div>
        <div className="flex gap-8">
          <Button
            variant="prominent"
            loading
            iconSlot={addIcon ? <PlusIcon /> : null}
          >
            Prominent button
          </Button>
          <Button
            variant="primary"
            loading
            iconSlot={addIcon ? <DownloadIcon /> : null}
          >
            Primary button
          </Button>
          <Button
            variant="secondary"
            loading
            iconSlot={addIcon ? <StarIcon /> : null}
          >
            Secondary button
          </Button>
        </div>
        <div className="flex gap-8">
          <Button
            variant="prominent"
            disabled
            iconSlot={addIcon ? <PlusIcon /> : null}
          >
            Prominent button
          </Button>
          <Button
            variant="primary"
            disabled
            iconSlot={addIcon ? <DownloadIcon /> : null}
          >
            Primary button
          </Button>
          <Button
            variant="secondary"
            disabled
            iconSlot={addIcon ? <StarIcon /> : null}
          >
            Secondary button
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ComponentsDemo;
