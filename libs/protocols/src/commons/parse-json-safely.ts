import { loggerGate } from "./loggerGate";
export const parseJsonSafely = (
  jsonString: string,
): Record<string, unknown> | null => {
  try {
    return JSON.parse(jsonString);
  } catch (e) {
    loggerGate.canError && console.error("Failed to parse JSON:", e);
    return null;
  }
};
