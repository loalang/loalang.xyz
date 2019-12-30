import React from "react";
import { Title } from "../Components/Title";
import { useNotebook } from "../Hooks/useNotebooks";
import { useRouteMatch } from "react-router-dom";
import { NotFoundView } from "./NotFoundView";
import { Code } from "@loalang/ui-toolbox/Code/Code";
import { Heading } from "@loalang/ui-toolbox/Typography/Heading";
import { PageHeading } from "@loalang/ui-toolbox/Typography/TextStyle/PageHeading";

export function NotebookView() {
  const {
    params: { id }
  } = useRouteMatch<{ id: string }>();

  const { isLoading, notebook } = useNotebook(id);

  return (
    <>
      {isLoading ? (
        "Loading..."
      ) : notebook == null ? (
        <NotFoundView />
      ) : (
        <>
          <Title>{`${notebook.title} by ${notebook.author.email}`}</Title>
          <Heading>
            <PageHeading>{notebook.title}</PageHeading>
          </Heading>
          <Code>{JSON.stringify(notebook, null, 2)}</Code>
        </>
      )}
    </>
  );
}
