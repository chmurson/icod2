export function toSafeFilename(input: string): string {
  return (
    input
      .replace(/[<>:"/\\|?*]/g, "_")
      .replace(/\s+/g, "_")
      .replace(/_{2,}/g, "_")
      .replace(/^_+|_+$/g, "")
      .substring(0, 255) || "untitled"
  );
}
