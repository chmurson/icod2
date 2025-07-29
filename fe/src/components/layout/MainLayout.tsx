import { Card } from "@radix-ui/themes";
import type { FC, PropsWithChildren, ReactNode } from "react";
import {
  cloneElement,
  createContext,
  isValidElement,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import headerCropppedUrl from "../../../public/header-cropped.jpg";

const mergeClassNames = (...classes: (string | undefined)[]) => {
  return classes.filter(Boolean).join(" ");
};

export const MainLayout: FC<PropsWithChildren> = ({ children }) => {
  return (
    <div className="h-full min-h-dvh">
      <HeaderImage />
      <ContentCard>{children}</ContentCard>
    </div>
  );
};

const ContentCardContext = createContext<{
  setOutsideContent: (content: ReactNode) => void;
} | null>(null);

interface ContentCardComponent extends FC<PropsWithChildren> {
  OutsideSlot: FC<PropsWithChildren<{ asChild?: boolean }>>;
}

export const ContentCard: ContentCardComponent = ({ children }) => {
  const [outsideContent, setOutsideContent] = useState<ReactNode>(null);

  const contextValue = useMemo(() => ({ setOutsideContent }), []);

  return (
    <ContentCardContext.Provider value={contextValue}>
      <div className="mx-auto max-w-5xl py-12">
        <Card className="mx-4 px-4 -mt-32 mb-4 min-h-96 box-border max-sm:px-0">
          <div className="p-6 px-24 max-md:px-8">{children}</div>
        </Card>
        {outsideContent}
      </div>
    </ContentCardContext.Provider>
  );
};

ContentCard.OutsideSlot = ({ children, asChild = false }) => {
  const context = useContext(ContentCardContext);

  useEffect(() => {
    if (!context) return;

    if (asChild && isValidElement(children)) {
      const currentProps = children.props as object;

      const currentClassname =
        "className" in currentProps ? (currentProps.className as string) : "";

      const mergedClassName = mergeClassNames(currentClassname, "px-4");

      context.setOutsideContent(
        cloneElement(children, {
          ...(children.props as object),
          className: mergedClassName,
        } as object),
      );
    } else {
      context.setOutsideContent(<div className="px-4">{children}</div>);
    }

    return () => {
      context?.setOutsideContent(null);
    };
  }, [children, context, asChild]);

  if (!context) {
    console.warn(
      "ContentCard.OutsideSlot must be used within a ContentCard component",
    );
    return null;
  }

  return null;
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
