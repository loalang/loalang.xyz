import uuid from "uuid/v4";
import ValidationError from "./ValidationError";
import Database from "./Database";
import hash from "./hash";
import User from "./User";
import FormInput from "./FormInput";

const EMAIL_PATTERN = /.@./;
const PASSWORD_PATTERN = /.+/;

export default async function register(
  database: Database,
  input: FormInput
): Promise<User> {
  if (!EMAIL_PATTERN.test(input.email)) {
    throw new ValidationError("Invalid email address");
  }

  if (!PASSWORD_PATTERN.test(input.password)) {
    throw new ValidationError("Invalid password");
  }

  const password = await hash(input.password);
  const id = uuid();
  const { email } = input;

  const user = { id, email };

  const successful = await database.insertUser(user, password);

  if (!successful) {
    throw new ValidationError(`User ${input.email} is already registered`);
  }

  return user;
}
