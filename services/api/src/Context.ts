import Search from "./Search/Search";
import PackageManager from "./PackageManager/PackageManager";
import { IncomingMessage, ServerResponse } from "http";
import Authentication from "./Authentication/Authentication";
import User from "./Resolvers/User";
import parseCookies from "cookies";
import Documentation from "./Documentation/Documentation";
import NotebooksDatabase from "./Notebooks/NotebooksDatabase";

export default interface Context {
  search: Search;
  pkg: PackageManager;
  auth: Authentication;
  docs: Documentation;
  user: User;
  notebooks: NotebooksDatabase;
}

export async function createContext(
  req: IncomingMessage,
  res: ServerResponse
): Promise<Context> {
  const search = Search.create();
  const pkg = PackageManager.create();
  const docs = Documentation.create();
  const auth = Authentication.create(parseCookies(req, res));
  const user = await auth.user();
  const notebooks = NotebooksDatabase.create();

  return {
    search,
    pkg,
    auth,
    docs,
    user,
    notebooks
  };
}
