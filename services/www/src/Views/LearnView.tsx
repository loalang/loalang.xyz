import React from "react";
import { Header } from "../Components/Header";
import { SafeArea } from "@loalang/ui-toolbox/SafeArea";

export function LearnView() {
  return (
    <>
      <Header>Learn</Header>
      <SafeArea left right bottom>
        {Array.from(new Array(1000), () => "Lorem ipsum")}
      </SafeArea>
    </>
  );
}
