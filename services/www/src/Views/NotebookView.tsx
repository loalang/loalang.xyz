import React, { useState, useEffect } from "react";
import { Title } from "../Components/Title";
import { useNotebook, useDeleteNotebook } from "../Hooks/useNotebooks";
import { useRouteMatch } from "react-router-dom";
import { NotFoundView } from "./NotFoundView";
import { Code } from "@loalang/ui-toolbox/Code/Code";
import { Heading } from "@loalang/ui-toolbox/Typography/Heading";
import { PageHeading } from "@loalang/ui-toolbox/Typography/TextStyle/PageHeading";
import { BooleanInput } from "@loalang/ui-toolbox/Forms/BooleanInput";
import { Button } from "@loalang/ui-toolbox/Forms/Button";

export function NotebookView() {
  const {
    params: { id }
  } = useRouteMatch<{ id: string }>();

  const { isLoading, notebook } = useNotebook(id);

  const [isSaving, setIsSaving] = useState(false);

  const [isDirty, setIsDirty] = useState(false);

  const [deleteNotebook] = useDeleteNotebook();

  useEffect(() => {
    if (!isSaving && isDirty) {
      setIsSaving(true);
      setTimeout(() => {
        setIsSaving(false);
        setIsDirty(false);
      }, 3000);
    }
  }, [isSaving, isDirty]);

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
          <Button onClick={() => deleteNotebook(notebook.id)}>Delete</Button>
          <BooleanInput value={isDirty} onChange={setIsDirty}>
            Dirty
          </BooleanInput>
          <Code>{JSON.stringify(notebook, null, 2)}</Code>
        </>
      )}
    </>
  );
}
