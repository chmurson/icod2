import { type FC, useRef } from "react";

export interface LoaderProps {
  message?: string;
  fullPage?: boolean;
  fadeDelay?: number;
}

const animationBaseDuration = 2500;

export const Loader: FC<LoaderProps> = ({
  message = "Loading...",
  fullPage = false,
  fadeDelay = 1000,
}) => {
  const fadeDelayRef = useRef(fadeDelay);

  const containerStyles = fullPage
    ? "fixed inset-0 flex flex-col items-center justify-center bg-white dark:bg-[#222222] z-50"
    : "flex flex-col items-center justify-center w-full min-h-[200px]";

  const animationDuration = Math.max(
    animationBaseDuration,
    Math.min(0, animationBaseDuration - fadeDelayRef.current),
  );

  const opacityStart = (
    1 -
    lerpRange(
      Math.max(-animationBaseDuration, Math.min(0, fadeDelayRef.current)),
      [-animationBaseDuration, 0],
      [0, 1],
    )
  ).toFixed(1);

  console.log(
    JSON.stringify({
      fadeDelay: fadeDelayRef.current,
      opacityStart,
    }),
  );

  return (
    <div
      className={containerStyles}
      style={{
        fontFamily:
          'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
        color: "#c089ff",
      }}
    >
      <style>{`
        @keyframes loader-spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes loader-fade {
          from {
            opacity: ${opacityStart};
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
      <div
        style={{
          opacity: 0,
          animation: `loader-fade ${animationDuration}ms linear forwards`,
          animationDelay: `${fadeDelayRef.current}ms`,
        }}
        className="items-center flex flex-col justify-center"
      >
        <div
          style={{
            width: "48px",
            height: "48px",
            border: "4px solid rgba(192, 137, 255, 0.25)",
            borderTopColor: "#c089ff",
            borderRadius: "50%",
            animation: "loader-spin 1s linear infinite",
            marginBottom: "12px",
          }}
        />
        <p>{message}</p>
      </div>
    </div>
  );
};

export default Loader;

export function lerpRange(
  value: number,
  from: [number, number],
  to: [number, number],
): number {
  const [a, b] = from;
  const [x, y] = to;

  if (a === b) {
    throw new Error("Source range cannot be zero-length.");
  }

  // Normalize value into 0..1
  const t = (value - a) / (b - a);

  // Map into target range
  return x + t * (y - x);
}
