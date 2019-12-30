import Notebook, { NotebookInput } from "./Notebook";
import Context from "../Context";

export default {
  NotebookBlock: {
    __resolveType(result: object) {
      return "CodeNotebookBlock";
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

      let notebook = await notebooks.find(user, notebookInput.id);

      if (notebook == null) {
        notebook = new Notebook(user, new Date(), notebookInput);
      } else {
        notebook.update(notebookInput);
      }

      await notebooks.publishNotebook(user, notebook);

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
