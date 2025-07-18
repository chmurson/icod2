import { twMerge } from "tailwind-merge";

/**
 * Utility function to merge Tailwind CSS classes with proper precedence.
 * Uses tailwind-merge for intelligent class deduplication and conflict resolution.
 *
 * @param inputs - Class strings to merge
 * @returns Merged class string
 */
export function cn(...inputs: (string | undefined | null | false)[]): string {
  return twMerge(inputs.filter(Boolean).join(" "));
}
