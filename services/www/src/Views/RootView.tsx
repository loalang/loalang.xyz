import "styled-components/macro";
import React from "react";
import { Helmet } from "react-helmet";
import { Router, RouteComponentProps } from "@reach/router";
import Header from "../Components/Header";
import { useQuery } from "react-apollo";
import gql from "graphql-tag";

export default function RootView() {
  return (
    <>
      <Helmet>
        <title>Loa Programming Language</title>
      </Helmet>

      <Router>
        <Home path="/" />
        <About path="/about" />
        <Contact path="/contact" />
        <NotFound default />
      </Router>
    </>
  );
}

const QUERY = gql`
  query HomeQuery {
    books {
      title
    }
  }
`;

function Home(_props: RouteComponentProps) {
  const { loading, data } = useQuery<{ books: { title: string }[] }>(QUERY);

  return (
    <>
      <Header>Home</Header>

      <main>
        {loading || data == null ? (
          "Loading..."
        ) : (
          <ul>
            {data.books.map(book => (
              <li key={book.title}>{book.title}</li>
            ))}
          </ul>
        )}
      </main>
    </>
  );
}

function About(_props: RouteComponentProps) {
  return (
    <>
      <Header>About</Header>

      <main>About</main>
    </>
  );
}

function Contact(_props: RouteComponentProps) {
  return (
    <>
      <Header>Contact</Header>

      <main>Contact</main>
    </>
  );
}

function NotFound(_props: RouteComponentProps) {
  return (
    <>
      <Header>Not Found!</Header>

      <main>Not Found!</main>
    </>
  );
}
