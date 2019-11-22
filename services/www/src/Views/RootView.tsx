import "styled-components/macro";
import React from "react";
import { Helmet } from "react-helmet";
import TopRouter from "../Components/TopRouter";
import { Home, Archive } from "../Components/Icons/Icon";
import DocsView from "./DocsView";
import HomeView from "./HomeView";

export default function RootView() {
  return (
    <>
      <Helmet>
        <title>Loa Programming Language</title>
      </Helmet>

      <TopRouter>
        <HomeView name="Home" path="/" icon={Home} />
        <DocsView name="Documentation" path="/docs" icon={Archive} />
      </TopRouter>
    </>
  );
}
