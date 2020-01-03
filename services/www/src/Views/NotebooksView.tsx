import React from "react";
import { Title } from "../Components/Title";
import { SafeArea } from "@loalang/ui-toolbox/SafeArea";
import { Heading } from "@loalang/ui-toolbox/Typography/Heading";
import { ItemHeading } from "@loalang/ui-toolbox/Typography/TextStyle/ItemHeading";
import { Section } from "@loalang/ui-toolbox/Typography/Section";
import { css } from "emotion";
import { useNotebooks, usePublishNotebook } from "../Hooks/useNotebooks";
import { Link, Switch, Route, useLocation } from "react-router-dom";
import { NotebookView } from "./NotebookView";
import { Button } from "@loalang/ui-toolbox/Forms/Button";
import { Icon } from "@loalang/ui-toolbox/Icons/Icon";
import uuid from "uuid/v4";
import { useHistory } from "react-router-dom";
import { useIsOffline } from "../Hooks/useIsOffline";
import { useMediaQuery } from "@loalang/ui-toolbox/useMediaQuery";

export function NotebooksView() {
  const { notebooks, isLoading } = useNotebooks();
  const history = useHistory();
  const { pathname } = useLocation();

  const [publish] = usePublishNotebook();
  const isOffline = useIsOffline();

  const isWide = useMediaQuery("(min-width: 700px)");

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
              display: ${!isWide && pathname !== "/notebooks"
                ? "none"
                : "block"};
              padding: 9px;
              flex: 0 1 200px;
            `}
          >
            <Heading>
              <ItemHeading>My Notebooks</ItemHeading>
            </Heading>

            <Button
              isDisabled={isOffline}
              onClick={() => {
                const id = uuid();

                publish({
                  id,
                  title: "",
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
                  <Link to={`/notebooks/${notebook.id}`}>
                    {notebook.title || "Untitled Notebook"}
                  </Link>
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
