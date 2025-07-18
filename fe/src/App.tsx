import { Theme } from "@radix-ui/themes";
import { type FC, useEffect, useState } from "react";
import {
  createBrowserRouter,
  Link,
  Route,
  RouterProvider,
  Routes,
} from "react-router-dom";
import Box from "./components/Box/sub-pages";
import LockedBox from "./components/Box/sub-pages/RestoreBoxes/LockedBox";
import ComponentsDemo from "./components/ComponentsDemo";
import CryptoPlayground from "./components/CryptoPlayground";
import DecodePlayground from "./components/DecodePlayground";
import { MainLayout } from "./components/MainLayout";

function useSystemTheme() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    // Check initial system preference
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    setTheme(mediaQuery.matches ? "dark" : "light");

    // Listen for changes to system preference
    const handleChange = (e: MediaQueryListEvent) => {
      setTheme(e.matches ? "dark" : "light");
    };

    mediaQuery.addEventListener("change", handleChange);

    // Cleanup listener on unmount
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return theme;
}

const Root: FC = () => {
  return (
    <>
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
      <MainLayout>
        <Routes>
          <Route path="crypto-poc" element={<CryptoPlayground />} />
          <Route path="decode-poc" element={<DecodePlayground />} />
          <Route path="/components-demo" element={<ComponentsDemo />} />
          <Route path="open-locked-box" element={<LockedBox />} />
          <Route path="open-locked-box/:keyHolderId" element={<LockedBox />} />
          <Route path="/" element={<Box />} />
          <Route path="*" element={<Box />} />
        </Routes>
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
        path: "/decode-poc",
        Component: DecodePlayground,
      },
      {
        path: "/:keyHolderId",
        Component: Box,
      },
      {
        path: "/open-locked-box",
        Component: LockedBox,
      },
      {
        path: "*",
        Component: Box,
      },
    ],
  },
]);

function App() {
  const theme = useSystemTheme();

  return (
    <Theme
      accentColor="plum"
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
