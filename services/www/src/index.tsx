import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import { root } from "./dom";
import { CSSProp } from "styled-components";

declare module "react" {
  interface Attributes {
    css?: CSSProp<{}>;
  }
}

ReactDOM.render(<App />, root);
