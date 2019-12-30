import User from "../Resolvers/User";
import Notebook from "../Resolvers/Notebook";
import LoggedInUser from "../Authentication/LoggedInUser";

const DB = new Map<string, Map<string, Notebook>>();

export default class NotebooksDatabase {
  static create() {
    return new NotebooksDatabase();
  }

  async getNotebooksBy(author: LoggedInUser): Promise<Notebook[]> {
    return Array.from(DB.get(author.id)?.values() ?? []);
  }

  async publishNotebook(
    author: LoggedInUser,
    notebook: Notebook
  ): Promise<void> {
    const notebooks = DB.get(author.id) ?? new Map();

    notebooks.set(notebook.id, notebook);

    DB.set(author.id, notebooks);
  }

  async deleteNotebook(author: LoggedInUser, id: string): Promise<void> {
    const notebooks = DB.get(author.id);

    if (notebooks != null) {
      notebooks.delete(id);
    }
  }

  async find(author: LoggedInUser, id: string): Promise<Notebook | null> {
    return DB.get(author.id)?.get(id) ?? null;
  }
}
