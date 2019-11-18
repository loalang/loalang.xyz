import React from "react";
import RootView from "./Views/RootView";
import ApolloClient from "apollo-boost";
import { ApolloProvider } from "react-apollo";

const client = new ApolloClient({ uri: process.env.REACT_APP_API_URL });

export default function App() {
  return (
    <ApolloProvider client={client}>
      <RootView />
    </ApolloProvider>
  );
}
