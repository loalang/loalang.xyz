import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import { root } from "./dom";
import { CSSProp } from "styled-components";
import { Icon } from "./Components/Icons/Icon";

declare module "react" {
  interface Attributes {
    css?: CSSProp<{}>;
    path?: string;
    name?: string;
    icon?: Icon;
  }
}

ReactDOM.render(<App />, root);
