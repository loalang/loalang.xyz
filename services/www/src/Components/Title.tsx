import React from "react";
import Helmet from "react-helmet";

export function Title({ children }: { children?: string }) {
  return (
    <Helmet>
      <title>
        {children != null
          ? `${children} | Loa Programming Language`
          : "Loa Programming Language"}
      </title>
    </Helmet>
  );
}
