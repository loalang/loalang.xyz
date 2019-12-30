import React from "react";
import { Title } from "../Components/Title";
import { SafeArea } from "@loalang/ui-toolbox/SafeArea";
import { Heading } from "@loalang/ui-toolbox/Typography/Heading";
import { ItemHeading } from "@loalang/ui-toolbox/Typography/TextStyle/ItemHeading";
import { Section } from "@loalang/ui-toolbox/Typography/Section";
import { css } from "emotion";
import { useNotebooks } from "../Hooks/useNotebooks";
import { Link, Switch, Route } from "react-router-dom";
import { NotebookView } from "./NotebookView";

export function NotebooksView() {
  const { notebooks, isLoading } = useNotebooks();

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
