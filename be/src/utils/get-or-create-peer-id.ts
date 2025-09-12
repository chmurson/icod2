import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { generateKeyPair, privateKeyFromRaw } from "@libp2p/crypto/keys";
import type { Ed25519PrivateKey } from "@libp2p/interface";

export async function getPeerIdFromEnv(
  envVarName = "LIBP2P_PRIVATE_KEY",
): Promise<Ed25519PrivateKey> {
  const privateKeyFromEnv = await loadKeyFromEnv(envVarName);
  if (privateKeyFromEnv) {
    console.log(`Loaded private key from env ${envVarName}`);
    return privateKeyFromRaw(privateKeyFromEnv) as Ed25519PrivateKey;
  }

  const keyFilePath = join(process.cwd(), "peer-id-private-key.json");
  const privateKeyBytes = await loadPrivateKeyFromFile(keyFilePath);

  if (privateKeyBytes) {
    console.log(`Loaded private key from file ${keyFilePath}`);
    return privateKeyFromRaw(privateKeyBytes) as Ed25519PrivateKey;
  }

  const keyPair = await generateKeyPair("Ed25519");

  await savePrivateKey(keyPair);
  console.log(`Created a new private key and saved it to ${keyFilePath}`);

  return keyPair;
}

function loadKeyFromEnv(
  envVarName = "LIBP2P_PRIVATE_KEY",
): Promise<Uint8Array | undefined> {
  const privateKeyEnv = process.env[envVarName];

  if (privateKeyEnv) {
    try {
      const privKey: number[] = JSON.parse(privateKeyEnv);
      const privateKeyBytes = new Uint8Array(privKey);
      return Promise.resolve(privateKeyBytes);
    } catch (error) {
      console.error(`Failed to parse private key from env: ${error}`);
      return Promise.reject(error);
    }
  }

  return Promise.resolve(undefined);
}

async function loadPrivateKeyFromFile(
  keyFilePath: string,
): Promise<Uint8Array | undefined> {
  try {
    await access(keyFilePath);
  } catch (error) {
    console.debug(`Failed to access private key file: ${error}`);
    return undefined;
  }

  try {
    const keyFileContent = await readFile(keyFilePath, "utf-8");
    const keyData = JSON.parse(keyFileContent);
    const privateKeyBytes = new Uint8Array(keyData.privateKey);

    return privateKeyBytes;
  } catch (error) {
    console.error(`Failed to read private key from file: ${error}`);
  }
}

async function savePrivateKeyToFile(
  keyFilePath: string,
  privateKeyBytes: Uint8Array,
): Promise<void> {
  try {
    await mkdir(dirname(keyFilePath), { recursive: true });
    await writeFile(
      keyFilePath,
      JSON.stringify({ privateKey: Array.from(privateKeyBytes) }),
    );
  } catch (error) {
    console.error(`Failed to save private key to file: ${error}`);
  }
}

async function savePrivateKey(keyPair: Ed25519PrivateKey): Promise<void> {
  const keyFilePath = join(process.cwd(), "peer-id-private-key.json");
  await savePrivateKeyToFile(keyFilePath, keyPair.raw);
}
