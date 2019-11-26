import server from "./server";
import fetch from "node-fetch";

(global as any).fetch = fetch;

server
  .listen({
    host: "0.0.0.0",
    port: 80
  })
  .then(({ url }) => {
    console.log(`🚀  Server ready at ${url}`);
  });
