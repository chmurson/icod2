export function generateNiceRandomToken(length = 22): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return uint8ArrayToBase64URL(array);
}

function uint8ArrayToBase64URL(uint8Array: Uint8Array): string {
  const base64String = btoa(String.fromCharCode(...uint8Array));

  const base64urlString = base64String
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  return base64urlString;
}
