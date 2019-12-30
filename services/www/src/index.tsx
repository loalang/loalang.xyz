import ReactDOM from "react-dom";
import App from "./App";
import * as serviceWorker from "./serviceWorker";

document.body.style.fontSize = "16px";

export const root = document.createElement("div");
document.body.appendChild(root);

App()
  .then(element => ReactDOM.render(element, root))
  .catch(e => {
    console.error(e);
    return alert("Something went wrong during initialization!");
  });

serviceWorker.register();
