import React from "react";
import { Header } from "../Components/Header";
import { SafeArea } from "@loalang/ui-toolbox/SafeArea";

export function NotFoundView() {
  return (
    <>
      <Header>Not Found</Header>
      <SafeArea left right bottom>
        Not Found
      </SafeArea>
    </>
  );
}
