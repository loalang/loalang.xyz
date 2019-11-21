import "styled-components/macro";
import React from "react";
import { Helmet } from "react-helmet";
import TopRouter from "../Components/TopRouter";
import { Home as HomeIcon, Info } from "../Components/Icons/Icon";
import { PageTitle } from "../Components/Header";

export default function RootView() {
  return (
    <>
      <Helmet>
        <title>Loa Programming Language</title>
      </Helmet>

      <TopRouter>
        <Home name="Home" path="/" icon={HomeIcon} />
        <About name="About" path="/about" icon={Info} />
      </TopRouter>
    </>
  );
}

function Home() {
  return (
    <>
      <PageTitle>Home</PageTitle>
      Home!
      <div style={{ height: 3000 }}></div>
    </>
  );
}

function About() {
  return (
    <>
      <PageTitle>About</PageTitle>
      About!
    </>
  );
}
