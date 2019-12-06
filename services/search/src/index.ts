import http from "http";
import Search from "./Search";
import AlgoliaSearch from "./AlgoliaSearch";
import Queue from "./Queue";
import AMQPQueue from "./AMQPQueue";

const search: Search = AlgoliaSearch.create();
const queue: Queue = AMQPQueue.create();

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(`http://incoming${req.url}`);
    res.setHeader("Content-Type", "application/json");
    switch (`${req.method} ${url.pathname}`) {
      case "GET /healthz":
        res.writeHead(200);
        res.write(JSON.stringify({ message: "OK" }));
        break;

      case "GET /search":
        const term = url.searchParams.get("term");
        const limit = Number(url.searchParams.get("limit") || 10);
        const offset = Number(url.searchParams.get("offset") || 0);
        const result = await search.search(term, limit, offset);
        res.writeHead(200);
        res.write(JSON.stringify(result));
        break;

      default:
        res.writeHead(404);
        res.write(JSON.stringify({ message: "Not Found" }));
        break;
    }
  } catch (e) {
    console.error(e);
    res.writeHead(500);
    res.write("Something went wrong!");
  } finally {
    res.end();
  }
});

queue.onPackagePublished(event => {
  search
    .index({
      __type: "PACKAGE",
      name: event.name
    })
    .catch(e => {
      console.error("Failed to ingest published package", event, e);
    });
});

server.listen(80, "0.0.0.0", () => {
  console.log("Started!");
});
