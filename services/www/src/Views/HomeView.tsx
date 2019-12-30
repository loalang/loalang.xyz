import React from "react";
import { SafeArea } from "@loalang/ui-toolbox/SafeArea";
import { Title } from "../Components/Title";

export function HomeView() {
  return (
    <>
      <Title />
      <SafeArea left right bottom>
        Home
      </SafeArea>
    </>
  );
}
