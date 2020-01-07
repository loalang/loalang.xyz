import Notebook, { NotebookInput, NotebookBlock } from "../Resolvers/Notebook";
import LoggedInUser from "../Authentication/LoggedInUser";

export default class NotebooksDatabase {
  static create() {
    return new NotebooksDatabase();
  }

  async getNotebooksBy(author: LoggedInUser): Promise<Notebook[]> {
    const response = await fetch(
      `${process.env.NOTEBOOKS_HOST}/notebooks?author=${author.id}`
    );
    if (response.status !== 200) {
      return [];
    }
    return (await response.json()).notebooks.map((n: any) => new Notebook(n));
  }

  async publishNotebook(
    author: LoggedInUser,
    notebook: NotebookInput
  ): Promise<Notebook> {
    const response = await fetch(`${process.env.NOTEBOOKS_HOST}/notebooks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        ...notebook,
        author: author.id,
        blocks: NotebookBlock.fromInputs(notebook.blocks)
      })
    });

    if (![200, 201].includes(response.status)) {
      throw new Error(await response.text());
    }

    return new Notebook((await response.json()).notebook);
  }

  async deleteNotebook(author: LoggedInUser, id: string): Promise<void> {
    await fetch(`${process.env.NOTEBOOKS_HOST}/notebooks/${id}`, {
      method: "DELETE",
      headers: {
        "X-Author-Id": author.id
      }
    });
  }

  async find(id: string): Promise<Notebook | null> {
    const response = await fetch(
      `${process.env.NOTEBOOKS_HOST}/notebooks/${id}`
    );

    if (response.status !== 200) {
      throw new Error(await response.text());
    }

    return new Notebook((await response.json()).notebook);
  }
}
