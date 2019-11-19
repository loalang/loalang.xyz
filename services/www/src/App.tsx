import React from "react";
import RootView from "./Views/RootView";
import ApolloClient from "apollo-boost";
import { ApolloProvider } from "react-apollo";

const client = new ApolloClient({ uri: getAPIUrl() });

export default function App() {
  return (
    <ApolloProvider client={client}>
      <RootView />
    </ApolloProvider>
  );
}

function getAPIUrl(): string {
  const { hostname } = new URL(window.location.href);

  if (hostname === "localhost") {
    return "http://localhost:8085";
  }

  return `https://${hostname.replace(/loalang\.xyz$/, "api.loalang.xyz")}`;
}
