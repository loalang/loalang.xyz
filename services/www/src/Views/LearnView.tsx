import React from "react";
import { SafeArea } from "@loalang/ui-toolbox/SafeArea";
import { Title } from "../Components/Title";

export function LearnView() {
  return (
    <>
      <Title>Learn</Title>
      <SafeArea left right bottom>
        {Array.from(new Array(1000), () => "Lorem ipsum")}
      </SafeArea>
    </>
  );
}
