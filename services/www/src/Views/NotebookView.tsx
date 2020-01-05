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
import { useRouteMatch, useHistory, Link } from "react-router-dom";
import { NotFoundView } from "./NotFoundView";
import { Heading } from "@loalang/ui-toolbox/Typography/Heading";
import { PageHeading } from "@loalang/ui-toolbox/Typography/TextStyle/PageHeading";
import { Button } from "@loalang/ui-toolbox/Forms/Button";
import { Form } from "@loalang/ui-toolbox/Forms/Form";
import { CodeInput } from "@loalang/ui-toolbox/Code/CodeInput";
import { EditableText } from "../Components/EditableText";
import { useTimeout, useDebouncedMemo } from "../Hooks/useTimeout";
import { useIsOffline } from "../Hooks/useIsOffline";
import uuid from "uuid/v4";
import { css } from "emotion";
import { Label } from "@loalang/ui-toolbox/Typography/TextStyle/Label";
import { Icon } from "@loalang/ui-toolbox/Icons/Icon";
import { useMediaQuery } from "@loalang/ui-toolbox/useMediaQuery";
import { Server } from "@loalang/loa";
import { Code } from "@loalang/ui-toolbox/Code/Code";

let server: {
  set(uri: string, code: string): void;
  evaluate(uri: string): string;
} | null = null;
const gettingServer = Server.load()
  .then((s: any) => (server = s))
  .then(() => console.log(server));

export default function NotebookView() {
  if (server == null) {
    throw gettingServer;
  }

  const {
    params: { id }
  } = useRouteMatch<{ id: string }>();

  const { isLoading, notebook: savedNotebook } = useNotebook(id);
  const [publish] = usePublishNotebook();

  const [deleteNotebook] = useDeleteNotebook();
  const history = useHistory();
  const [notebook, setNotebook] = useState(savedNotebook);
  const isOffline = useIsOffline();

  const isWide = useMediaQuery("(min-width: 800px)");

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

          {!isWide && (
            <div
              className={css`
                margin-bottom: 15px;
              `}
            >
              <Link to="/notebooks">
                <Label>
                  <Icon.ArrowLeft /> My Notebooks
                </Label>
              </Link>
            </div>
          )}

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
              <Label>
                <Icon.Trash /> Delete Notebook
              </Label>
            </Button>
          </div>

          <Form.Array<Notebook, "blocks"> field="blocks">
            {({ items, insert, unshift, push }) => (
              <>
                <CreateBlockButton onCreate={unshift} />
                <ol>
                  {items.map(({ value, onChange, remove }, index) => {
                    const addBetweenButton =
                      index === 0 ? null : (
                        <CreateBlockButton
                          onCreate={block => insert(index, block)}
                        />
                      );

                    const blockId = `${notebook.id}:${value.id}`;

                    const deleteBlockButton = (
                      <DeleteBlockButton
                        onClick={() => {
                          server!.set(blockId, "");
                          remove();
                        }}
                      />
                    );

                    switch (value.__typename) {
                      case "CodeNotebookBlock":
                        return (
                          <li key={value.id}>
                            {addBetweenButton}
                            <div
                              className={css`
                                position: relative;
                              `}
                            >
                              {deleteBlockButton}
                              <Form value={value} onChange={onChange}>
                                <Form.Input<
                                  CodeNotebookBlock,
                                  "code"
                                > field="code">
                                  {({ value, onChange }) => (
                                    <>
                                      <CodeInput
                                        language="loa"
                                        value={value}
                                        onChange={onChange}
                                      />
                                      <EvaluateCode id={blockId}>
                                        {value}
                                      </EvaluateCode>
                                    </>
                                  )}
                                </Form.Input>
                              </Form>
                            </div>
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

function EvaluateCode({
  id,
  children: code
}: {
  id: string;
  children: string;
}) {
  const [result, title] = useDebouncedMemo(
    200,
    useCallback(() => {
      server!.set(id, code);
      try {
        return [server!.evaluate(id), "Result"];
      } catch (e) {
        console.log(e);
        return Array.isArray(e) ? [e.join("\n"), "Error"] : [null, null];
      }
    }, [id, code])
  );
  if (result == null) {
    return null;
  }
  return (
    <div
      className={css`
        color: ${title === "Error" ? "#FF0048" : "#000"};
        margin: 10px 14px 0;
      `}
    >
      <Label>{title}</Label>
      <output>
        <Code raw block>
          {result}
        </Code>
      </output>
    </div>
  );
}

function DeleteBlockButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      aria-label="Delete Block"
      type="button"
      className={css`
        cursor: pointer;
        position: absolute;
        z-index: 10;
        right: 5px;
        top: 5px;
        width: 1.2em;
        height: 1.2em;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        overflow: hidden;
        box-shadow: 0 2px 3px rgba(0, 0, 0, 0.3);
      `}
      onClick={() => onClick()}
    >
      <Icon.Trash />
    </button>
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
        cursor: pointer;

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
    >
      <div
        className={css`
          background: #fff;
          display: inline;
          position: relative;
          top: -0.5em;
        `}
      >
        <Icon.Plus />
      </div>
    </button>
  );
}
