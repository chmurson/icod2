import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { generateKeyPair, privateKeyFromRaw } from "@libp2p/crypto/keys";
import type { Ed25519PrivateKey } from "@libp2p/interface";
import type { Logger } from "../logger.js";
import { getLogger } from "../logger.js";

export async function getPeerIdFromEnv(
  envVarName = "LIBP2P_PRIVATE_KEY",
): Promise<Ed25519PrivateKey> {
  const logger = getLogger();
  const privateKeyFromEnv = await loadKeyFromEnv(envVarName, logger);
  if (privateKeyFromEnv) {
    logger.info(
      { envVarName },
      "Loaded libp2p private key from environment variable",
    );
    return privateKeyFromRaw(privateKeyFromEnv) as Ed25519PrivateKey;
  }

  const keyFilePath =
    process.env.PEER_ID_FILE_PATH ||
    join(process.cwd(), "../data/peer-id-private-key.json");
  const privateKeyBytes = await loadPrivateKeyFromFile(keyFilePath, logger);

  if (privateKeyBytes) {
    logger.info({ keyFilePath }, "Loaded libp2p private key from filesystem");
    return privateKeyFromRaw(privateKeyBytes) as Ed25519PrivateKey;
  }

  const keyPair = await generateKeyPair("Ed25519");

  await savePrivateKey(keyPair, keyFilePath, logger);
  logger.info(
    { keyFilePath },
    "Generated new libp2p private key and persisted to filesystem",
  );

  return keyPair;
}

async function loadKeyFromEnv(
  envVarName: string,
  logger: Logger,
): Promise<Uint8Array | undefined> {
  const privateKeyEnv = process.env[envVarName];

  if (!privateKeyEnv) {
    return undefined;
  }

  try {
    const privKey: number[] = JSON.parse(privateKeyEnv);
    return new Uint8Array(privKey);
  } catch (error) {
    logger.error(
      { err: error, envVarName },
      "Failed to parse libp2p private key from environment",
    );
    throw error;
  }
}

async function loadPrivateKeyFromFile(
  keyFilePath: string,
  logger: Logger,
): Promise<Uint8Array | undefined> {
  try {
    await access(keyFilePath);
  } catch (error) {
    logger.debug(
      { err: error, keyFilePath },
      "Private key file not accessible",
    );
    return undefined;
  }

  try {
    const keyFileContent = await readFile(keyFilePath, "utf-8");
    const keyData = JSON.parse(keyFileContent) as { privateKey: number[] };
    return new Uint8Array(keyData.privateKey);
  } catch (error) {
    logger.error(
      { err: error, keyFilePath },
      "Failed to read libp2p private key from filesystem",
    );
    return undefined;
  }
}

async function savePrivateKeyToFile(
  keyFilePath: string,
  privateKeyBytes: Uint8Array,
  logger: Logger,
): Promise<void> {
  try {
    await mkdir(dirname(keyFilePath), { recursive: true });
    await writeFile(
      keyFilePath,
      JSON.stringify({ privateKey: Array.from(privateKeyBytes) }),
    );
  } catch (error) {
    logger.error(
      { err: error, keyFilePath },
      "Failed to persist libp2p private key to filesystem",
    );
  }
}

async function savePrivateKey(
  keyPair: Ed25519PrivateKey,
  keyFilePath: string,
  logger: Logger,
): Promise<void> {
  await savePrivateKeyToFile(keyFilePath, keyPair.raw, logger);
}
