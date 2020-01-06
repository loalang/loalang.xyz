import {
  CommandPayload,
  OnDiagnosticsEventPayload,
  OnResultEventPayload
} from "./protocol";

const gettingServer = import("@loalang/loa").then(({ Server }) =>
  Server.load()
);

globalThis.addEventListener("message", async event => {
  const payload: CommandPayload = JSON.parse(event.data);
  const server = await gettingServer;

  switch (payload.__type) {
    case "SET":
      server.set(payload.uri, payload.code);
      break;
    case "EVALUATE":
      try {
        const result = server.evaluate(payload.uri);
        const response: OnResultEventPayload = {
          __type: "RESULT",
          uri: payload.uri,
          result
        };
        globalThis.postMessage(JSON.stringify(response), "*");
      } catch (e) {
        if (Array.isArray(e)) {
          const response: OnDiagnosticsEventPayload = {
            __type: "DIAGNOSTICS",
            uri: payload.uri,
            diagnostics: e
          };
          globalThis.postMessage(JSON.stringify(response), "*");
        } else {
          throw e;
        }
      }
      break;
  }
});
