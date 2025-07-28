import type { FC, PropsWithChildren } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/ui/Button";

export const LeaveLobbyButton: FC<PropsWithChildren> = ({ children }) => {
  return (
    <div className="flex justify-center mt-8">
      <Link to="/" style={{ textDecoration: "none" }}>
        <Button className="px-20" variant="alt-primary">
          {children}
        </Button>
      </Link>
    </div>
  );
};
