import { Card } from "@radix-ui/themes";
import type { FC, PropsWithChildren } from "react";
import headerCropppedUrl from "../../public/header-cropped.jpg";

export const MainLayout: FC<PropsWithChildren> = ({ children }) => {
  return (
    <div className="h-full min-h-dvh">
      <HeaderImage />
      <ContentCard>{children}</ContentCard>
    </div>
  );
};

const ContentCard: FC<PropsWithChildren> = ({ children }) => {
  return (
    <Card className="max-w-5xl mx-auto px-4 -mt-20 w-full mb-18 min-h-96">
      <div className="p-6 px-24 max-md:px-8">{children}</div>
    </Card>
  );
};

const HeaderImage: FC = () => {
  return (
    <div
      style={{
        backgroundImage: `url(${headerCropppedUrl})`,
      }}
      className="
				  b-image
          w-full
           h-64
           shadow
           bg-center
           bg-[length:auto_256px]
        "
    />
  );
};
