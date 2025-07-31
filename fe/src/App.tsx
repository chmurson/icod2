import { Theme } from "@radix-ui/themes";
import { type FC, useEffect, useState } from "react";
import {
  createBrowserRouter,
  Link,
  Outlet,
  RouterProvider,
} from "react-router-dom";
import { RootLockBox } from "./components/Box/sub-pages/CreationBoxes";
import LockedBox from "./components/Box/sub-pages/RestoreBoxes/LockedBox";
import Welcome from "./components/Box/sub-pages/Welcome";
import ComponentsDemo from "./components/ComponentsDemo";
import CryptoPlayground from "./components/CryptoPlayground";
import DecodePlayground from "./components/DecodePlayground";
import { MainLayout } from "./components/layout/MainLayout";
import "./utils/devExpSettings";

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

const Root: FC = () => {
  return (
    <>
      {window.icod2Dev.topNavTools.get() === true && (
        <nav className="bg-[#ffffffAA] absolute w-full p-2 dark:text-gray-700">
          <Link to="/" style={{ marginRight: 16, textDecoration: "none" }}>
            Box
          </Link>
          <Link
            to="/crypto-poc"
            style={{ marginRight: 16, textDecoration: "none" }}
          >
            Crypto Playground
          </Link>
          <Link
            to="/decode-poc"
            style={{ marginRight: 16, textDecoration: "none" }}
          >
            Decode Playground
          </Link>
          <Link to="/components-demo" style={{ textDecoration: "none" }}>
            Components Demo
          </Link>
        </nav>
      )}
      <MainLayout>
        <Outlet />
      </MainLayout>
    </>
  );
};

const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      {
        path: "/crypto-poc",
        Component: CryptoPlayground,
      },
      {
        path: "/components-demo",
        Component: ComponentsDemo,
      },
      {
        path: "/decode-poc",
        Component: DecodePlayground,
      },
      {
        path: "/unlock-box/:sessionId?",
        Component: LockedBox,
      },
      {
        path: "/lock-box/:sessionId?",
        Component: RootLockBox,
      },
      {
        path: "/",
        index: true,
        Component: Welcome,
      },
      {
        path: "*",
        Component: Welcome,
      },
    ],
  },
]);

function App() {
  const theme = useSystemTheme();

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
      <RouterProvider router={router} />
    </Theme>
  );
}

export default App;
