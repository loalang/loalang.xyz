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
import { Heading } from "@loalang/ui-toolbox/Typography/Heading";
import { PageHeading } from "@loalang/ui-toolbox/Typography/TextStyle/PageHeading";
import { Button } from "@loalang/ui-toolbox/Forms/Button";
import { Form } from "@loalang/ui-toolbox/Forms/Form";
import { CodeInput } from "@loalang/ui-toolbox/Code/CodeInput";
import { EditableText } from "../Components/EditableText";
import { useTimeout } from "../Hooks/useTimeout";
import { useIsOffline } from "../Hooks/useIsOffline";
import uuid from "uuid/v4";
import { css } from "emotion";

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
  }, [savedNotebook, setNotebook]);

  useTimeout(
    1000,
    useCallback(() => {
      if (notebook != null && notebook !== savedNotebook) {
        publish(notebook);
      }
    }, [notebook, savedNotebook, publish])
  );

  return (
    <div
      className={css`
        padding: 30px;
      `}
    >
      {isLoading && notebook == null ? (
        "Loading..."
      ) : notebook == null ? (
        <NotFoundView />
      ) : (
        <Form value={notebook} onChange={setNotebook}>
          <Title>{`${notebook.title || "Untitled Notebook"} by ${
            notebook.author.email
          }`}</Title>
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

          <div
            className={css`
              margin: 10px 0;
            `}
          >
            <Button
              isDisabled={isOffline}
              onClick={() => {
                deleteNotebook(notebook.id);

                history.push("/notebooks");
              }}
            >
              Delete
            </Button>
          </div>

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
                                  <CodeInput
                                    language="loa"
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
        </Form>
      )}
    </div>
  );
}

function CreateBlockButton({
  onCreate
}: {
  onCreate: (block: NotebookBlock) => void;
}) {
  return (
    <button
      aria-label="Create Block"
      type="button"
      className={css`
        width: 100%;
        height: 2px;
        box-sizing: content-box;
        border: 9px solid #fff;
        border-left: 0;
        border-right: 0;
        background-color: transparent;
        margin: 2px 0;

        &:hover,
        &:focus {
          outline: 0;
          background-color: rgba(0, 0, 214, 0.2);
        }
      `}
      onClick={() =>
        onCreate({
          __typename: "CodeNotebookBlock",
          id: uuid(),
          code: ""
        })
      }
    />
  );
}
