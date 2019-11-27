import { pbkdf2 as pbkdf2Callback } from "crypto";
import { promisify } from "util";

const pbkdf2 = promisify(pbkdf2Callback);

const SALT = process.env.PASSWORD_HASH_SALT || "";

export default function hash(password: string): Promise<Buffer> {
  return pbkdf2(password, SALT, 100000, 64, "sha512");
}
