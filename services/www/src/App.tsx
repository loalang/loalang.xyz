import React from "react";
import RootView from "./Views/RootView";
import { ApolloClient } from "apollo-client";
import { ApolloProvider } from "react-apollo";
import { HttpLink } from "apollo-link-http";
import {
  InMemoryCache,
  IntrospectionFragmentMatcher
} from "apollo-cache-inmemory";
import { Reset } from "@loalang/ui-toolbox/Reset";
import { BrowserRouter } from "react-router-dom";
import { CachePersistor } from "apollo-cache-persist";
import { didRefresh } from "./didRefresh";

export default async function App() {
  const cache = new InMemoryCache({
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
  });

  const persistor = new CachePersistor({
    cache,
    storage: window.localStorage as any
  });

  if (!didRefresh()) {
    await persistor.restore();
  }

  const client = new ApolloClient({
    link: new HttpLink({
      uri: getAPIUrl(),
      credentials: "include"
    }),
    cache
  });

  return (
    <Reset>
      <BrowserRouter>
        <ApolloProvider client={client}>
          <RootView />
        </ApolloProvider>
      </BrowserRouter>
    </Reset>
  );
}

function getAPIUrl(): string {
  const { hostname } = new URL(window.location.href);

  if (hostname === "localhost") {
    return process.env.REACT_APP_API_URL!;
  }

  return `https://${hostname.replace(/loalang\.xyz$/, "api.loalang.xyz")}`;
}
