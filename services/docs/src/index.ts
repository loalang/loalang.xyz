import http from "http";
import Queue from "./Queue";
import AMQPQueue from "./AMQPQueue";
import { Database, Doc } from "./Database";
import { RedisDatabase } from "./RedisDatabase";
import IngestPackage from "./IngestPackage";

const queue: Queue = AMQPQueue.create();
const database: Database = RedisDatabase.create();
const ingest = new IngestPackage(database);

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(`http://incoming${req.url}`);
    res.setHeader("Content-Type", "application/json");
    const p = `${req.method} ${url.pathname}`;
    let m: RegExpMatchArray | null;
    if (p === "GET /healthz") {
      res.writeHead(200);
      res.write(JSON.stringify({ message: "OK" }));
    } else if (p === "GET /root-namespaces") {
      const namespaces = await database.rootNamespaces();
      res.writeHead(200);
      res.write(JSON.stringify({ message: "OK", namespaces }));
    } else if ((m = /^GET \/describe\/(.*)$/.exec(p))) {
      const doc = await database.describe(m[1]);
      if (doc == null) {
        res.writeHead(404);
        res.write(JSON.stringify({ message: "Not Found" }));
      } else {
        res.writeHead(200);
        res.write(JSON.stringify({ message: "OK", doc }));
      }
    } else {
      res.writeHead(404);
      res.write(JSON.stringify({ message: "Not Found" }));
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
