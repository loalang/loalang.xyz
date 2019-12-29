import React from "react";
import { Header } from "../Components/Header";
import { SafeArea } from "@loalang/ui-toolbox/SafeArea";

export function DocsView() {
  return (
    <>
      <Header>Docs</Header>
      <SafeArea left right bottom>
        Docs
      </SafeArea>
    </>
  );
}
