import Notebook, { NotebookInput } from "./Notebook";
import Context from "../Context";

export default {
  NotebookBlock: {
    __resolveType(result: object) {
      if ("code" in result) {
        return "CodeNotebookBlock";
      } else {
        return "TextNotebookBlock";
      }
    }
  },

  Mutation: {
    async publishNotebook(
      _: any,
      { notebook: notebookInput }: { notebook: NotebookInput },
      { user, notebooks }: Context
    ): Promise<Notebook> {
      if (!user.isLoggedIn()) {
        throw new Error("Only logged in users can publish notebooks.");
      }

      const notebook = await notebooks.publishNotebook(user, notebookInput);

      return notebook;
    },

    async deleteNotebook(
      _: any,
      { id }: { id: string },
      { user, notebooks }: Context
    ) {
      if (!user.isLoggedIn()) {
        throw new Error("Only logged in users can delete notebooks.");
      }

      await notebooks.deleteNotebook(user, id);

      return "OK";
    }
  }
};
