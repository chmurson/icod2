import { differenceInDays, isValid, parseISO } from "date-fns";

export function safeParseAndCheckRecent(
  timestampOrDateIso: string | number,
  timeToleranceInDays = 1,
): Date | null {
  let date: Date;

  if (typeof timestampOrDateIso === "string") {
    date = parseISO(timestampOrDateIso);
  } else if (typeof timestampOrDateIso === "number") {
    // Assume unix seconds
    date = new Date(timestampOrDateIso * 1000);
  } else {
    return null;
  }

  if (!isValid(date)) return null;

  const now = new Date();
  const diff = Math.abs(differenceInDays(date, now));

  if (diff <= timeToleranceInDays) {
    return date;
  }
  return null;
}
