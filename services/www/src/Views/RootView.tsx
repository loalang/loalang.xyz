import "styled-components/macro";
import React from "react";
import { Helmet } from "react-helmet";
import TopRouter from "../Components/TopRouter";
import { Home, Archive, Person } from "../Components/Icons/Icon";
import DocsView from "./DocsView";
import HomeView from "./HomeView";
import DashboardView from "./DashboardView";

export default function RootView() {
  return (
    <>
      <Helmet>
        <title>Loa Programming Language</title>
      </Helmet>

      <div
        css={`
          min-height: 70vh;
        `}
      >
        <TopRouter>
          <HomeView name="Home" path="/" icon={Home} />
          <DocsView name="Documentation" path="/docs" icon={Archive} />
          <DashboardView name="Dashboard" path="/dashboard" icon={Person} />
        </TopRouter>
      </div>
    </>
  );
}
