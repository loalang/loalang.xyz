import React, { useState, useCallback } from "react";
import { Title } from "../Components/Title";
import {
  useNotebook,
  useDeleteNotebook,
  Notebook,
  usePublishNotebook,
  CodeNotebookBlock,
  NotebookBlock,
  TextNotebookBlock
} from "../Hooks/useNotebooks";
import { useCompiler } from "../Hooks/useCompiler";
import { useRouteMatch, useHistory, Link } from "react-router-dom";
import { NotFoundView } from "./NotFoundView";
import { Heading } from "@loalang/ui-toolbox/Typography/Heading";
import { PageHeading } from "@loalang/ui-toolbox/Typography/TextStyle/PageHeading";
import { Button } from "@loalang/ui-toolbox/Forms/Button";
import { Form } from "@loalang/ui-toolbox/Forms/Form";
import { CodeInput } from "@loalang/ui-toolbox/Code/CodeInput";
import { Loading } from "@loalang/ui-toolbox/Loading";
import { EditableText } from "../Components/EditableText";
import { useTimeout } from "../Hooks/useTimeout";
import { useIsOffline } from "../Hooks/useIsOffline";
import uuid from "uuid/v4";
import { css } from "emotion";
import { Label } from "@loalang/ui-toolbox/Typography/TextStyle/Label";
import { Icon } from "@loalang/ui-toolbox/Icons/Icon";
import { useMediaQuery } from "@loalang/ui-toolbox/useMediaQuery";
import { Code } from "@loalang/ui-toolbox/Code/Code";
import { Compiler } from "../Compiler";
import { useUser, User } from "../Hooks/useAuth";
import { Body } from "@loalang/ui-toolbox/Typography/TextStyle/Body";
import { Basic } from "@loalang/ui-toolbox/Typography/TextStyle/Basic";

export default function NotebookView() {
  const {
    params: { id }
  } = useRouteMatch<{ id: string }>();
  const { isLoading, notebook } = useNotebook(id);
  const { user } = useUser();

  const isAuthor =
    user != null && notebook != null && user.id === notebook.author.id;

  return (
    <div
      className={css`
        padding: 30px;
      `}
    >
      {isLoading && notebook == null ? (
        <Loading />
      ) : notebook == null ? (
        <NotFoundView />
      ) : isAuthor ? (
        <EditableNotebook notebook={notebook} />
      ) : (
        <ReadOnlyNotebook notebook={notebook} user={user} />
      )}
    </div>
  );
}

function EditableNotebook({ notebook: savedNotebook }: { notebook: Notebook }) {
  const { compiler, diagnostics, results } = useCompiler(
    useCallback(
      (compiler: Compiler) => {
        for (const block of savedNotebook.blocks) {
          if (block.__typename === "CodeNotebookBlock") {
            const blockId = `${savedNotebook.id}:${block.id}`;
            compiler.set(blockId, block.code);
            compiler.evaluate(blockId);
          }
        }
      },
      [savedNotebook.blocks, savedNotebook.id]
    )
  );

  const [notebook, setNotebook] = useState(savedNotebook);

  const [deleteNotebook] = useDeleteNotebook();

  const history = useHistory();
  const isOffline = useIsOffline();

  const [publish] = usePublishNotebook();

  useTimeout(
    200,
    useCallback(() => {
      if (notebook != null) {
        publish(notebook);
      }
    }, [notebook, publish])
  );

  const isWide = useMediaQuery("(min-width: 800px)");

  return (
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
              <EditableText placeholder="Untitled Notebook" onChange={onChange}>
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
                      compiler!.set(blockId, "");
                      remove();
                    }}
                  />
                );

                switch (value.__typename) {
                  case "TextNotebookBlock":
                    return (
                      <li key={value.id}>
                        {addBetweenButton}
                        <div
                          className={css`
                            position: relative;
                            margin-bottom: 2px;
                          `}
                        >
                          {deleteBlockButton}
                          <Form value={value} onChange={onChange}>
                            <Form.Input<TextNotebookBlock, "text"> field="text">
                              {({ value, onChange }) => (
                                <CodeInput value={value} onChange={onChange} />
                              )}
                            </Form.Input>
                          </Form>
                        </div>
                      </li>
                    );

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
                            <Form.Input<CodeNotebookBlock, "code"> field="code">
                              {({ value, onChange }) => (
                                <>
                                  <CodeInput
                                    language="loa"
                                    value={value}
                                    onChange={onChange}
                                  />
                                  <div
                                    className={css`
                                      margin: 10px 7px 0;
                                    `}
                                  >
                                    <EvaluationResult
                                      diagnostics={diagnostics[blockId] || []}
                                      result={results[blockId]}
                                    />
                                  </div>
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
  );
}

function ReadOnlyNotebook({
  notebook,
  user
}: {
  notebook: Notebook;
  user: User | null;
}) {
  const [publish] = usePublishNotebook();
  const history = useHistory();

  const { diagnostics, results } = useCompiler(
    useCallback(
      (compiler: Compiler) => {
        for (const block of notebook.blocks) {
          if (block.__typename === "CodeNotebookBlock") {
            const blockId = `${notebook.id}:${block.id}`;
            compiler.set(blockId, block.code);
            compiler.evaluate(blockId);
          }
        }
      },
      [notebook.blocks, notebook.id]
    )
  );

  return (
    <>
      <Title>{`${notebook.title || "Untitled Notebook"} by ${
        notebook.author.email
      }`}</Title>

      <Heading>
        <PageHeading>{notebook.title || "Untitled Notebook"}</PageHeading>
      </Heading>

      <Basic>by {notebook.author.email}</Basic>

      {user != null && (
        <div
          className={css`
            margin-top: 5px;
          `}
        >
          <Button
            onClick={() => {
              const id = uuid();
              publish({
                id,
                title: notebook.title,
                blocks: notebook.blocks
              });
              history.push(`/notebooks/${id}`);
            }}
          >
            <Label>
              <Icon.Edit /> Clone
            </Label>
          </Button>
        </div>
      )}

      <ol
        className={css`
          li {
            margin-top: 10px;
          }
        `}
      >
        {notebook.blocks.map(block => {
          switch (block.__typename) {
            case "CodeNotebookBlock": {
              const blockId = `${notebook.id}:${block.id}`;
              return (
                <li key={block.id}>
                  <Code raw block language="loa">
                    {block.code}
                  </Code>
                  <div
                    className={css`
                      margin: 7px 0;
                    `}
                  >
                    <EvaluationResult
                      diagnostics={diagnostics[blockId] || []}
                      result={results[blockId]}
                    />
                  </div>
                </li>
              );
            }
            case "TextNotebookBlock":
              return (
                <li key={block.id}>
                  <Body>{block.text}</Body>
                </li>
              );
            default:
              return null;
          }
        })}
      </ol>
    </>
  );
}

function EvaluationResult({
  result,
  diagnostics
}: {
  result: string | undefined | null;
  diagnostics: string[];
}) {
  if (result === undefined && diagnostics.length === 0) {
    return <Loading />;
  }

  return (
    <>
      {result != null && (
        <div className={css``}>
          <Label>Result</Label>
          <output>
            <Code raw block>
              {result}
            </Code>
          </output>
        </div>
      )}
      {diagnostics.length > 0 && (
        <div
          className={css`
            color: #ff0048;
          `}
        >
          <Label>Error</Label>
          <output>
            <Code raw block>
              {diagnostics.join("\n")}
            </Code>
          </output>
        </div>
      )}
    </>
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
        right: -0.6em;
        top: -0.6em;
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
  const [isDropped, setIsDropped] = useState(false);
  return (
    <div
      className={css`
        position: relative;
      `}
    >
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
        onClick={() => setIsDropped(!isDropped)}
      >
        <div
          className={css`
            background: #fff;
            display: inline;
            position: relative;
            top: -0.6em;
          `}
        >
          <Icon.Plus />
        </div>
      </button>
      {isDropped && (
        <ul
          className={css`
            position: absolute;
            z-index: 20;
            left: 50%;
            transform: translate(-50%);
          `}
        >
          <li>
            <Button
              onClick={() => {
                onCreate({
                  __typename: "CodeNotebookBlock",
                  id: uuid(),
                  code: ""
                });
                setIsDropped(false);
              }}
            >
              Code Block
            </Button>
          </li>
          <li>
            <Button
              onClick={() => {
                onCreate({
                  __typename: "TextNotebookBlock",
                  id: uuid(),
                  text: ""
                });
                setIsDropped(false);
              }}
            >
              Text Block
            </Button>
          </li>
        </ul>
      )}
    </div>
  );
}
