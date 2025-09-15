export const parseJsonSafely = (
  jsonString: string,
): Record<string, unknown> | null => {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Failed to parse JSON:", error);
    return null;
  }
};
