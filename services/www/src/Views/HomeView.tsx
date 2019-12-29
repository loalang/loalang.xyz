import React from "react";
import { Header } from "../Components/Header";
import { SafeArea } from "@loalang/ui-toolbox/SafeArea";

export function HomeView() {
  return (
    <>
      <Header />
      <SafeArea left right bottom>
        Home
      </SafeArea>
    </>
  );
}
