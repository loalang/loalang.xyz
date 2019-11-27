import Database from "./Database";
import hash from "./hash";
import User from "./User";
import FormInput from "./FormInput";

const database = Database.create();

export default async function login(input: FormInput): Promise<User | null> {
  const password = await hash(input.password);
  const { email } = input;

  return database.findUser(email, password);
}
