import gql from "graphql-tag";
import { useQuery, useMutation, useApolloClient } from "react-apollo";
import { useUser } from "./useAuth";

export interface NotebookListing {
  id: string;
  title: string;
  author: {
    id: string;
    email: string;
  };
}

export interface Notebook {
  id: string;
  title: string;
  author: {
    id: string;
    email: string;
  };

  createdAt: Date;
  updatedAt: Date;

  blocks: NotebookBlock[];
}

export type NotebookBlock = CodeNotebookBlock | TextNotebookBlock;

export interface CodeNotebookBlock {
  __typename: "CodeNotebookBlock";
  id: string;
  code: string;
}

export interface TextNotebookBlock {
  __typename: "TextNotebookBlock";
  id: string;
  text: string;
}

const GET_NOTEBOOKS_QUERY = gql`
  query GetNotebooks {
    me {
      id
      notebooks {
        id
        title
        author {
          id
          email
        }
      }
    }
  }
`;

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

const NOTEBOOK_FRAGMENT = gql`
  fragment notebook on Notebook {
    id
    title
    author {
      id
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

      ... on TextNotebookBlock {
        id
        text
      }
    }
  }
`;

const FIND_NOTEBOOK_QUERY = gql`
  query FindNotebook($id: String!) {
    me {
      id
      notebook(id: $id) {
        ...notebook
      }
    }
  }

  ${NOTEBOOK_FRAGMENT}
`;

export function useNotebook(
  id: string
): { isLoading: boolean; error: Error | null; notebook: Notebook | null } {
  const { loading, error, data } = useQuery(FIND_NOTEBOOK_QUERY, {
    variables: { id }
  });

  const notebook = data == null || data.me == null ? null : data.me.notebook;

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

const PUBLISH_NOTEBOOK_MUTATION = gql`
  mutation PublishNotebook($notebook: NotebookInput!) {
    publishNotebook(notebook: $notebook) {
      ...notebook
    }
  }

  ${NOTEBOOK_FRAGMENT}
`;

export function usePublishNotebook(): [
  (notebook: {
    id: string;
    title: string;
    blocks: NotebookBlock[];
  }) => Promise<void>,
  { isPublishing: boolean; error: Error | null }
] {
  const [mutate, { loading, error }] = useMutation(PUBLISH_NOTEBOOK_MUTATION);
  const client = useApolloClient();
  const { notebooks: existingListings } = useNotebooks();
  const { user } = useUser();

  return [
    async notebook => {
      if (user == null) {
        throw new Error("Only logged in users can publish notebooks");
      }

      const mutating = mutate({
        variables: {
          notebook: {
            id: notebook.id,
            title: notebook.title,
            blocks: notebook.blocks.map(block => {
              switch (block.__typename) {
                case "CodeNotebookBlock":
                  return {
                    code: { id: block.id, code: block.code }
                  };
                case "TextNotebookBlock":
                  return {
                    text: { id: block.id, text: block.text }
                  };
                default:
                  return {};
              }
            })
          }
        }
      });

      client.cache.writeQuery({
        query: GET_NOTEBOOKS_QUERY,
        data: {
          me: {
            __typename: "User",
            id: user.id,
            notebooks: Array.from(
              new Map(
                [
                  ...existingListings,
                  {
                    __typename: "Notebook",
                    id: notebook.id,
                    title: notebook.title,
                    author: {
                      __typename: "User",
                      id: user.id,
                      email: user.email
                    }
                  }
                ].map(n => [n.id, n])
              ),
              ([_, n]) => n
            )
          }
        }
      });

      await mutating;
    },
    { isPublishing: loading, error: error || null }
  ];
}

const DELETE_NOTEBOOK_MUTATION = gql`
  mutation DeleteNotebook($id: String!) {
    deleteNotebook(id: $id)
  }
`;

export function useDeleteNotebook(): [
  (id: string) => Promise<void>,
  { isDeleting: boolean; error: Error | null }
] {
  const [mutate, { loading, error }] = useMutation(DELETE_NOTEBOOK_MUTATION);
  const client = useApolloClient();
  const { user } = useUser();
  const { notebooks: existingListings } = useNotebooks();

  return [
    async id => {
      if (user == null) {
        throw new Error("Only logged in users can publish notebooks");
      }

      const mutating = mutate({ variables: { id } });

      client.cache.writeQuery({
        query: FIND_NOTEBOOK_QUERY,
        data: {
          me: {
            __typename: "User",
            id: user.id,
            notebook: null
          }
        },
        variables: { id }
      });

      client.cache.writeQuery({
        query: GET_NOTEBOOKS_QUERY,
        data: {
          me: {
            __typename: "User",
            id: user.id,
            notebooks: existingListings.filter(n => n.id !== id)
          }
        }
      });

      await mutating;
    },
    {
      isDeleting: loading,
      error: error || null
    }
  ];
}
