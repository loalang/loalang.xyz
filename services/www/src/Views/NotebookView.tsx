import React, { useState, useEffect, useCallback } from "react";
import { Title } from "../Components/Title";
import {
  useNotebook,
  useDeleteNotebook,
  Notebook,
  usePublishNotebook
} from "../Hooks/useNotebooks";
import { useRouteMatch, useHistory } from "react-router-dom";
import { NotFoundView } from "./NotFoundView";
import { Code } from "@loalang/ui-toolbox/Code/Code";
import { Heading } from "@loalang/ui-toolbox/Typography/Heading";
import { PageHeading } from "@loalang/ui-toolbox/Typography/TextStyle/PageHeading";
import { Button } from "@loalang/ui-toolbox/Forms/Button";
import { Form } from "@loalang/ui-toolbox/Forms/Form";
import { EditableText } from "../Components/EditableText";
import { useTimeout } from "../Hooks/useTimeout";

export function NotebookView() {
  const {
    params: { id }
  } = useRouteMatch<{ id: string }>();

  const { isLoading, notebook: savedNotebook } = useNotebook(id);
  const [publish] = usePublishNotebook();

  const [deleteNotebook] = useDeleteNotebook();
  const history = useHistory();
  const [notebook, setNotebook] = useState(savedNotebook);

  useEffect(() => {
    setNotebook(savedNotebook);
  }, [savedNotebook]);

  useTimeout(
    1000,
    useCallback(() => {
      if (notebook != null && notebook !== savedNotebook) {
        publish(notebook);
      }
    }, [notebook, savedNotebook, publish])
  );

  return (
    <>
      {isLoading ? (
        "Loading..."
      ) : notebook == null ? (
        <NotFoundView />
      ) : (
        <Form value={notebook} onChange={setNotebook}>
          <Title>{`${notebook.title} by ${notebook.author.email}`}</Title>
          <Heading>
            <Form.Input<Notebook, "title"> field="title">
              {({ value, onChange }) => (
                <PageHeading>
                  <EditableText
                    placeholder="Untitled Notebook"
                    onChange={onChange}
                  >
                    {value}
                  </EditableText>
                </PageHeading>
              )}
            </Form.Input>
          </Heading>
          <Button
            onClick={() => {
              deleteNotebook(notebook.id);

              history.push("/notebooks");
            }}
          >
            Delete
          </Button>
          <Code>{JSON.stringify(notebook, null, 2)}</Code>
        </Form>
      )}
    </>
  );
}
