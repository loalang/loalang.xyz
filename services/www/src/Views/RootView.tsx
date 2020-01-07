import React, { Suspense } from "react";
import { Switch, Route } from "react-router-dom";
import { StorefrontView } from "./StorefrontView";
import { LearnView } from "./LearnView";
import { DocsView } from "./DocsView";
import { ProfileView } from "./ProfileView";
import { NotebooksView } from "./NotebooksView";
import { NotFoundView } from "./NotFoundView";
import { Header } from "../Components/Header";

export default function RootView() {
  return (
    <>
      <Header />

      <Suspense fallback={""}>
        <Switch>
          <Route path="/" exact>
            <StorefrontView />
          </Route>
          <Route path="/docs">
            <DocsView />
          </Route>
          <Route path="/me">
            <ProfileView />
          </Route>
          <Route path="/learn">
            <LearnView />
          </Route>
          <Route path="/notebooks">
            <NotebooksView />
          </Route>
          <Route>
            <NotFoundView />
          </Route>
        </Switch>
      </Suspense>
    </>
  );
}
