export function areArraysOfPrimitiveEqual<
  T extends Record<string, string | number | boolean | null | undefined>,
  U extends Record<string, string | number | boolean | null | undefined>,
>(arr1: T[], arr2: U[]): boolean {
  if (arr1.length !== arr2.length) {
    return false;
  }

  if (arr1.length === 0) {
    return true;
  }

  function serializeObject(obj: T | U): string {
    const sortedKeys = Object.keys(obj).sort();
    const pairs = sortedKeys.map((key) => `${key}:${JSON.stringify(obj[key])}`);
    return `{${pairs.join(",")}}`;
  }

  const objectCount = new Map<string, number>();

  for (const obj of arr1) {
    const serialized = serializeObject(obj);
    objectCount.set(serialized, (objectCount.get(serialized) || 0) + 1);
  }

  for (const obj of arr2) {
    const serialized = serializeObject(obj);
    const count = objectCount.get(serialized);

    if (count === undefined) {
      return false;
    }

    if (count === 1) {
      objectCount.delete(serialized);
    } else {
      objectCount.set(serialized, count - 1);
    }
  }

  return objectCount.size === 0;
}
