import server from "./server";

server
  .listen({
    host: "0.0.0.0",
    port: process.env.PORT || 8085
  })
  .then(({ url }) => {
    console.log(`🚀  Server ready at ${url}`);
  });
