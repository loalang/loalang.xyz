import React from "react";
import { Docs } from "@loalang/docs/Docs/Docs";
import { redirectTo } from "@reach/router";

export default function DocsView() {
  return (
    <Docs
      path={window.location.pathname}
      basePath="/docs/api"
      rootNamespaces={["Loa"]}
      onNavigate={redirectTo}
      getClass={async () => {
        throw new Error();
      }}
      getSubNamespaces={async (name: string) => {
        return {
          classes: [],
          subNamespaces: []
        };
      }}
    />
  );
}
