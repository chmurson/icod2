/**
 * Compares two Record<string, Record<string, boolean>> objects,
 * considering only which keys have true values (order irrelevant).
 */
export function hasSameTrueKeys(
  a: Record<string, Record<string, boolean>>,
  b: Record<string, Record<string, boolean>>,
): boolean {
  const allKeys = new Set([...Object.keys(a), ...Object.keys(b)]);
  return [...allKeys.values()].every(
    (key) => getTrueKeySet(a[key]) === getTrueKeySet(b[key]),
  );
}

function getTrueKeySet(obj: Record<string, boolean> | undefined): string {
  if (!obj) {
    return "";
  }
  const trueKeys: string[] = Object.entries(obj)
    .filter(([_, value]) => value === true)
    .map(([key]) => key);

  trueKeys.sort();
  return trueKeys.join(",");
}
