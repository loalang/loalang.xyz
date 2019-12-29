import React from "react";
import { Header } from "../Components/Header";
import { SafeArea } from "@loalang/ui-toolbox/SafeArea";

export function NotebooksView() {
  return (
    <>
      <Header>Notebooks</Header>
      <SafeArea left right bottom>
        Notebooks
      </SafeArea>
    </>
  );
}
