import Database from "./Database";
import hash from "./hash";
import User from "./User";
import FormInput from "./FormInput";

export default async function login(
  database: Database,
  input: FormInput
): Promise<User | null> {
  const password = await hash(input.password);
  const { email } = input;

  return database.findUser(email, password);
}
