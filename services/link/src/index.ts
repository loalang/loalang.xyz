import http from "http";
import Database from "./Database";

const database = Database.create();

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(`http://incoming${req.url}`);
    res.setHeader("Content-Type", "application/json");
    switch (`${req.method} ${url.pathname}`) {
      case "GET /healthz":
        await database.checkHealth();
        res.writeHead(200);
        res.write(JSON.stringify({ message: "OK" }));
        break;

      default:
        res.writeHead(404);
        res.write(JSON.stringify({ message: "Not Found" }));
        break;
    }
  } catch (e) {
    console.error(e);
    res.writeHead(500);
    res.write(JSON.stringify({ message: "Something went wrong!" }));
  } finally {
    res.end();
  }
});

server.listen(80, "0.0.0.0", () => {
  console.log("Started!");
});
