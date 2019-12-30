import gql from "graphql-tag";
import { useQuery } from "react-apollo";

const GET_NOTEBOOKS_QUERY = gql`
  query GetNotebooks {
    me {
      id
      notebooks {
        id
        title
        author {
          email
        }
      }
    }
  }
`;

const FIND_NOTEBOOK_QUERY = gql`
  query FindNotebook($id: String!) {
    me {
      id
      notebook(id: $id) {
        id
        title
        author {
          email
        }

        createdAt
        updatedAt

        blocks {
          __typename

          ... on CodeNotebookBlock {
            id
            code
          }
        }
      }
    }
  }
`;

export interface NotebookListing {
  id: string;
  title: string;
  author: {
    email: string;
  };
}

export interface Notebook {
  id: string;
  title: string;
  author: {
    email: string;
  };

  createdAt: Date;
  updatedAt: Date;

  blocks: NotebookBlock[];
}

export type NotebookBlock = CodeNotebookBlock;

export interface CodeNotebookBlock {
  __typename: "CodeNotebookBlock";
  id: string;
  code: string;
}

export function useNotebooks(): {
  isLoading: boolean;
  error: Error | null;
  notebooks: NotebookListing[];
} {
  const { loading, error, data } = useQuery(GET_NOTEBOOKS_QUERY);

  return {
    isLoading: loading,
    error: error || null,
    notebooks: data == null || data.me == null ? [] : data.me.notebooks
  };
}

export function useNotebook(
  id: string
): { isLoading: boolean; error: Error | null; notebook: Notebook } {
  const { loading, error, data } = useQuery(FIND_NOTEBOOK_QUERY, {
    variables: { id }
  });

  const notebook = data == null || data.me == null ? [] : data.me.notebook;

  if (notebook != null) {
    notebook.createdAt = new Date(notebook.createdAt);
    notebook.updatedAt = new Date(notebook.updatedAt);
  }

  return {
    isLoading: loading,
    error: error || null,
    notebook
  };
}
