import { type FC, lazy, Suspense } from "react";
import {
  createBrowserRouter,
  Link,
  Outlet,
  RouterProvider,
} from "react-router-dom";
import Welcome from "./Box/sub-pages/Welcome";
import { MainLayout } from "./layout";
import { FullPageLoader, Loader } from "./ui";

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
        <Suspense fallback={<Loader />}>
          <Outlet />
        </Suspense>
      </MainLayout>
    </>
  );
};

const CreationBoxes = lazy(() =>
  import("./Box/sub-pages/CreationBoxes").then((mod) => ({
    default: mod.RootLockBox,
  })),
);

const LockedBoxes = lazy(() =>
  import("./Box/sub-pages/RestoreBoxes/LockedBox").then((mod) => ({
    default: mod.default,
  })),
);

const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    HydrateFallback: () => <FullPageLoader message="Loading Stashcrate..." />,
    children: [
      {
        path: "/crypto-poc",
        async lazy() {
          const mod = await import("./CryptoPlayground");
          return { Component: mod.default };
        },
      },
      {
        path: "/components-demo",
        async lazy() {
          const mod = await import("./ComponentsDemo");
          return { Component: mod.default };
        },
      },
      {
        path: "/decode-poc",
        async lazy() {
          const mod = await import("./DecodePlayground");
          return { Component: mod.default };
        },
      },
      {
        path: "/unlock-box/:roomToken?",
        element: (
          <Suspense fallback={<FullPageLoader message="Loading..." />}>
            <LockedBoxes />
          </Suspense>
        ),
      },
      {
        path: "/lock-box/:roomToken?",
        element: (
          <Suspense fallback={<FullPageLoader message="Loading..." />}>
            <CreationBoxes />
          </Suspense>
        ),
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

export const RootRoutes = () => {
  return <RouterProvider router={router} />;
};
