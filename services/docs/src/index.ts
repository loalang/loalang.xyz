import http from "http";
import Queue from "./Queue";
import AMQPQueue from "./AMQPQueue";
import { Database } from "./Database";
import { RedisDatabase } from "./RedisDatabase";
import IngestPackage from "./IngestPackage";

const queue: Queue = AMQPQueue.create();
const database: Database = RedisDatabase.create();
const ingest = new IngestPackage(database);

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(`http://incoming${req.url}`);
    res.setHeader("Content-Type", "application/json");
    switch (`${req.method} ${url.pathname}`) {
      case "GET /healthz":
        res.writeHead(200);
        res.write(JSON.stringify({ message: "OK" }));
        break;

      case "GET /root-namespaces": {
        const namespaces = await database.rootNamespaces();
        res.writeHead(200);
        res.write(JSON.stringify({ message: "OK", namespaces }));
        break;
      }

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

queue.onPackagePublished(async event => {
  try {
    await ingest.ingest(event);
  } catch (e) {
    console.error("Failed to ingest published package", event, e);
  }
});

server.listen(80, "0.0.0.0", () => {
  console.log("Started!");
});
