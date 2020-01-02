import React, { useState, useEffect, useCallback } from "react";
import { Title } from "../Components/Title";
import {
  useNotebook,
  useDeleteNotebook,
  Notebook,
  usePublishNotebook,
  CodeNotebookBlock,
  NotebookBlock
} from "../Hooks/useNotebooks";
import { useRouteMatch, useHistory } from "react-router-dom";
import { NotFoundView } from "./NotFoundView";
import { Code } from "@loalang/ui-toolbox/Code/Code";
import { Heading } from "@loalang/ui-toolbox/Typography/Heading";
import { PageHeading } from "@loalang/ui-toolbox/Typography/TextStyle/PageHeading";
import { Button } from "@loalang/ui-toolbox/Forms/Button";
import { Form } from "@loalang/ui-toolbox/Forms/Form";
import { TextInput } from "@loalang/ui-toolbox/Forms/TextInput";
import { EditableText } from "../Components/EditableText";
import { useTimeout } from "../Hooks/useTimeout";
import { useIsOffline } from "../Hooks/useIsOffline";
import uuid from "uuid/v4";
import { Icon } from "@loalang/ui-toolbox/Icons/Icon";

export function NotebookView() {
  const {
    params: { id }
  } = useRouteMatch<{ id: string }>();

  const { isLoading, notebook: savedNotebook } = useNotebook(id);
  const [publish] = usePublishNotebook();

  const [deleteNotebook] = useDeleteNotebook();
  const history = useHistory();
  const [notebook, setNotebook] = useState(savedNotebook);
  const isOffline = useIsOffline();

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
            isDisabled={isOffline}
            onClick={() => {
              deleteNotebook(notebook.id);

              history.push("/notebooks");
            }}
          >
            Delete
          </Button>

          <Form.Array<Notebook, "blocks"> field="blocks">
            {({ items, insert, unshift, push }) => (
              <>
                <CreateBlockButton onCreate={unshift} />
                <ol>
                  {items.map(({ value, onChange }, index) => {
                    const addBetween =
                      index === 0 ? null : (
                        <CreateBlockButton
                          onCreate={block => insert(index, block)}
                        />
                      );

                    switch (value.__typename) {
                      case "CodeNotebookBlock":
                        return (
                          <li key={value.id}>
                            {addBetween}
                            <Form value={value} onChange={onChange}>
                              <Form.Input<
                                CodeNotebookBlock,
                                "code"
                              > field="code">
                                {({ value, onChange }) => (
                                  <TextInput
                                    value={value}
                                    onChange={onChange}
                                  />
                                )}
                              </Form.Input>
                            </Form>
                          </li>
                        );

                      default:
                        return null;
                    }
                  })}
                </ol>
                <CreateBlockButton onCreate={push} />
              </>
            )}
          </Form.Array>

          <Code>{JSON.stringify(notebook, null, 2)}</Code>
        </Form>
      )}
    </>
  );
}

function CreateBlockButton({
  onCreate
}: {
  onCreate: (block: NotebookBlock) => void;
}) {
  return (
    <Button
      onClick={() =>
        onCreate({
          __typename: "CodeNotebookBlock",
          id: uuid(),
          code: ""
        })
      }
    >
      <Icon.Edit />
      Create Block
    </Button>
  );
}
