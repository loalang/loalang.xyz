import User, { USER_RECORD_VERSION } from "./User";
import {
  generateKeyPairSync,
  createPrivateKey,
  KeyObject,
  createPublicKey,
  privateEncrypt,
  publicDecrypt
} from "crypto";
import ValidationError from "./ValidationError";

const envKeyString = process.env.JWT_PRIVATE_KEY;

let keyPair: { privateKey: KeyObject; publicKey: KeyObject };
if (envKeyString) {
  const privateKey = createPrivateKey(envKeyString);
  keyPair = {
    privateKey,
    publicKey: createPublicKey(privateKey)
  };
} else {
  keyPair = generateKeyPairSync("rsa", {
    modulusLength: 2048
  });
}

interface TokenRecord {
  version: number;
  user: User;
  expires: string;
}

const A_DAY = 1000 * 60 * 60 * 24;
const THIRY_DAYS = A_DAY * 30;

export function pack(user: User): string {
  const expires = new Date(Date.now() + THIRY_DAYS);
  const record = {
    version: USER_RECORD_VERSION,
    user,
    expires: expires.toUTCString()
  };
  const recordJSON = JSON.stringify(record);
  const recordBuffer = privateEncrypt(
    keyPair.privateKey,
    Buffer.from(recordJSON)
  );
  const token = recordBuffer.toString("base64");

  return token;
}

export function unpack(
  token: string
): { user: User; secondsLeftUntilExpiry: number } {
  try {
    const tokenBuffer = Buffer.from(token, "base64");
    const recordBuffer = publicDecrypt(keyPair.privateKey, tokenBuffer);
    const recordJSON = recordBuffer.toString("utf-8");
    const record: TokenRecord = JSON.parse(recordJSON);

    if (record.version !== USER_RECORD_VERSION) {
      throw new Error();
    }

    const now = new Date();
    const expires = new Date(record.expires);
    if (expires < now) {
      throw new Error();
    }

    return {
      user: record.user,
      secondsLeftUntilExpiry: Math.floor(
        (expires.getTime() - now.getTime()) / 1000
      )
    };
  } catch {
    throw new ValidationError("Invalid token");
  }
}
