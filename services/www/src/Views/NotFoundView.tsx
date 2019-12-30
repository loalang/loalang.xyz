import React from "react";
import { SafeArea } from "@loalang/ui-toolbox/SafeArea";
import { Title } from "../Components/Title";

export function NotFoundView() {
  return (
    <>
      <Title>Not Found</Title>
      <SafeArea left right bottom>
        Not Found
      </SafeArea>
    </>
  );
}
