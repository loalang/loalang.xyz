import React from "react";
import { Title } from "../Components/Title";
import { SafeArea } from "@loalang/ui-toolbox/SafeArea";
import { Heading } from "@loalang/ui-toolbox/Typography/Heading";
import { ItemHeading } from "@loalang/ui-toolbox/Typography/TextStyle/ItemHeading";
import { Section } from "@loalang/ui-toolbox/Typography/Section";
import { css } from "emotion";
import { useNotebooks, usePublishNotebook } from "../Hooks/useNotebooks";
import { Link, Switch, Route } from "react-router-dom";
import { NotebookView } from "./NotebookView";
import { Button } from "@loalang/ui-toolbox/Forms/Button";
import { Icon } from "@loalang/ui-toolbox/Icons/Icon";
import uuid from "uuid/v4";
import { useHistory } from "react-router-dom";

export function NotebooksView() {
  const { notebooks, isLoading } = useNotebooks();
  const history = useHistory();

  const [publish] = usePublishNotebook();

  return (
    <>
      <Title>Notebooks</Title>
      <SafeArea left right bottom>
        <div
          className={css`
            display: flex;
          `}
        >
          <div
            className={css`
              padding: 9px;
              flex: 0 1 300px;
            `}
          >
            <Heading>
              <ItemHeading>My Notebooks</ItemHeading>
            </Heading>

            <Button
              onClick={() => {
                const id = uuid();

                publish({
                  id,
                  title: "New Notebook",
                  blocks: []
                });

                history.push(`/notebooks/${id}`);
              }}
            >
              <Icon.Edit /> Create
            </Button>

            {isLoading && "Loading..."}

            <ul>
              {notebooks.map(notebook => (
                <li key={notebook.id}>
                  <Link to={`/notebooks/${notebook.id}`}>{notebook.title}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div
            className={css`
              flex: 2 2 auto;
            `}
          >
            <Section>
              <Switch>
                <Route path="/notebooks/:id">
                  <NotebookView />
                </Route>
              </Switch>
            </Section>
          </div>
        </div>
      </SafeArea>
    </>
  );
}
