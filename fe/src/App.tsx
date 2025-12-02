import { Theme } from "@radix-ui/themes";
import { lazy, Suspense, useEffect, useState } from "react";
import { FullPageLoader } from "./components/ui";

function useSystemTheme() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    setTheme(mediaQuery.matches ? "dark" : "light");

    const handleChange = (e: MediaQueryListEvent) => {
      setTheme(e.matches ? "dark" : "light");
    };

    mediaQuery.addEventListener("change", handleChange);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return theme;
}

const LazyRootRoutes = lazy(() =>
  import("./components/RootRoutes").then((mod) => ({
    default: mod.RootRoutes,
  })),
);

function App() {
  const theme = useSystemTheme();
  console.log("App");

  return (
    <Theme
      accentColor="violet"
      appearance={theme}
      grayColor="gray"
      panelBackground="translucent"
      scaling="100%"
      radius="medium"
      style={{ backgroundColor: "inherit" }}
    >
      <Suspense fallback={<FullPageLoader message="Loading Stashcrate..." />}>
        <LazyRootRoutes />
      </Suspense>
    </Theme>
  );
}

export default App;
