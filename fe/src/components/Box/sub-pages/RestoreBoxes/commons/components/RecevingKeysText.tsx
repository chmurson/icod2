import { useEffect, useState } from "react";
import { Text } from "@/ui/Typography";

export const LoadingTextReceiveingKeys = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [dotCount, setDotCount] = useState(0);

  useEffect(() => {
    const showTimer = setTimeout(() => {
      setIsVisible(true);
    }, 500);

    return () => clearTimeout(showTimer);
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const dotTimer = setInterval(() => {
      setDotCount((prev) => (prev + 1) % 4); // 0, 1, 2, 3, then back to 0
    }, 500);

    return () => clearInterval(dotTimer);
  }, [isVisible]);

  return (
    <Text
      variant="secondaryText"
      className={`self-center transition-opacity duration-500 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      Receiving keys, please wait
      <span className={dotCount >= 1 ? "opacity-100" : "opacity-0"}>.</span>
      <span className={dotCount >= 2 ? "opacity-100" : "opacity-0"}>.</span>
      <span className={dotCount >= 3 ? "opacity-100" : "opacity-0"}>.</span>
    </Text>
  );
};
