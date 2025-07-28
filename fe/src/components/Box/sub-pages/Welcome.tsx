import type React from "react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { useOpenLockedBoxStore } from "@/stores/boxStore";
import { Button } from "@/ui/Button";
import { Typography } from "@/ui/Typography";

const Welcome: React.FC = () => {
  return (
    <div className="flex flex-col gap-4 pb-12">
      <Typography variant="pageTitle" as="h1" className="mt-2">
        Decentralised Box
      </Typography>
      <InfoBox
        title="Create a Box"
        text={
          <>
            <p className="my-1">Start by creating a box. You’ll:</p>
            <ul className="my-1">
              <li>- Define the message or content you want to protect.</li>
              <li>
                - Invite other keyholders (your friends or devices) to join.
              </li>
              <li>
                - Set a key threshold (e.g. 3 out of 5) — the number of
                keyholders required to unlock the box later
              </li>
              <li>
                - Lock the Box, downloads yours and share the remainig Locked
                Boxes with every keyholder
              </li>
              <li>
                - Every Locked Box contains the same ecrypted message, but a
                different key.
              </li>
            </ul>
          </>
        }
        buttonSlot={
          <Link to="/lock-box" style={{ textDecoration: "none" }}>
            <Button variant="prominent" className="text-nowrap">
              Create Box
            </Button>
          </Link>
        }
      />
      <InfoBox
        title="Open a Locked Box"
        text={
          <>
            <p className="my-1">
              Once you downloaded a Locked Box, you can unlock it again, but
              only when:
            </p>
            <ul className="my-1">
              <li>
                - At least the required number of keyholds (as set during
                creation by Key Trehsold) agree to open it.
              </li>
              <li>
                - You’ll confirm your intent to unlock the content with
                keyholders
              </li>
            </ul>
          </>
        }
        buttonSlot={
          <Link to="/unlock-box" style={{ textDecoration: "none" }}>
            <Button
              onClick={useOpenLockedBoxStore((state) => state.actions.start)}
              variant="prominent"
              className="whitespace-nowrap"
            >
              Open a Locked Box
            </Button>
          </Link>
        }
      />
    </div>
  );
};

const InfoBox = ({
  buttonSlot,
  text,
  title,
}: {
  title: string;
  text: ReactNode;
  buttonSlot: ReactNode;
}) => (
  <div className="flex gap-2 flex-col">
    <Typography variant="sectionTitle">{title}</Typography>
    <div className="flex flex-row gap-6 justify-between max-md:flex-col">
      <Typography variant="primaryText" className="text-sm">
        {text}
      </Typography>
      <div className="flex justify-center items-end max-md:justify-start">
        {buttonSlot}
      </div>
    </div>
  </div>
);

export default Welcome;
