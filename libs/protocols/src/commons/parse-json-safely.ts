import logger from "./customLogger";

export const parseJsonSafely = (
  jsonString: string,
): Record<string, unknown> | null => {
  try {
    return JSON.parse(jsonString);
  } catch (e) {
    logger.error("Failed to parse JSON:", e);
    return null;
  }
};
