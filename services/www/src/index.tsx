import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import * as serviceWorker from "./serviceWorker";

document.body.style.fontSize = "16px";

export const root = document.createElement("div");
document.body.appendChild(root);
ReactDOM.render(<App />, root);

serviceWorker.register();
