import { useEffect, useState } from "react";

const tailwindBreakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
};

export function useTailwindBreakpoints() {
  const [width, setWidth] = useState(() => window.innerWidth);

  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return {
    isBase: width < tailwindBreakpoints.sm,
    isSm: width >= tailwindBreakpoints.sm && width < tailwindBreakpoints.md,
    isMd: width >= tailwindBreakpoints.md && width < tailwindBreakpoints.lg,
    isLg: width >= tailwindBreakpoints.lg && width < tailwindBreakpoints.xl,
    isXl: width >= tailwindBreakpoints.xl && width < tailwindBreakpoints["2xl"],
    is2xl: width >= tailwindBreakpoints["2xl"],
    isMaxSm: width < tailwindBreakpoints.sm,
    isMaxMd: width < tailwindBreakpoints.md,
    isMaxLg: width < tailwindBreakpoints.lg,
    isMaxXl: width < tailwindBreakpoints.xl,
    isMax2xl: width < tailwindBreakpoints["2xl"],
  };
}
