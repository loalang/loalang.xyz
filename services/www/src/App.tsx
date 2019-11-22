import React from "react";
import RootView from "./Views/RootView";
import { ApolloClient } from "apollo-client";
import { ApolloProvider } from "react-apollo";
import { HttpLink } from "apollo-link-http";
import {
  InMemoryCache,
  IntrospectionFragmentMatcher
} from "apollo-cache-inmemory";

const client = new ApolloClient({
  link: new HttpLink({
    uri: getAPIUrl()
  }),
  cache: new InMemoryCache({
    fragmentMatcher: new IntrospectionFragmentMatcher({
      introspectionQueryResultData: {
        __schema: {
          types: [
            {
              kind: "",
              name: "SearchResult",
              possibleTypes: [
                {
                  name: "Package"
                },
                {
                  name: "ClassDoc"
                }
              ]
            }
          ]
        }
      }
    })
  })
});

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
