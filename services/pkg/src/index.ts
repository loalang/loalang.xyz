import http from "http";
import HttpError from "./HttpError";
import { Readable } from "stream";
import { parse } from "./Publication";
import publish from "./publish";
import { inspectPackage, inspectVersion, inspectPublisher } from "./inspect";

const server = http.createServer(async (req, res) => {
  try {
    res.setHeader("Content-Type", "application/json");

    const url = new URL(`http://incoming${req.url}`);
    const header = `${req.method} ${url.pathname}`;
    let match: RegExpExecArray | null;
    if ((match = /^GET \/healthz$/.exec(header))) {
      res.writeHead(200);
      res.write(JSON.stringify({ message: "OK" }));
    } else if ((match = /^PUT \/packages\/(.*)$/.exec(header))) {
      const name = decodeURIComponent(match[1]);
      const version = url.searchParams.get("version");
      const pkg = await publish(await parse(name, version, req));

      res.writeHead(201);
      res.write(JSON.stringify({ message: "OK", package: pkg }));
    } else if ((match = /^GET \/packages\/(.+)$/.exec(header))) {
      const name = decodeURIComponent(match[1]);
      const version = url.searchParams.get("version");

      const result =
        version == null
          ? await inspectPackage(name)
          : await inspectVersion(name, version);

      if (result == null) {
        res.writeHead(404);
        res.write(JSON.stringify({ message: "Not Found" }));
      } else if (version == null) {
        res.writeHead(200);
        res.write(JSON.stringify({ message: "OK", package: result }));
      } else {
        res.writeHead(200);
        res.write(JSON.stringify({ message: "OK", version: result }));
      }
    } else if ((match = /^GET \/publishers\/([^/]+)$/.exec(header))) {
      const publisherId = match[1];

      const publisher = await inspectPublisher(publisherId);

      if (publisher == null) {
        res.writeHead(404);
        res.write(JSON.stringify({ message: "Not Found" }));
      } else {
        res.writeHead(200);
        res.write(JSON.stringify({ message: "OK", publisher }));
      }
    } else {
      res.writeHead(404);
      res.write(JSON.stringify({ message: "Not Found" }));
    }
  } catch (e) {
    if (e instanceof HttpError) {
      res.writeHead(e.statusCode);
      res.write(JSON.stringify({ message: e.message }));
    } else {
      console.error(e);
      res.writeHead(500);
      res.write(JSON.stringify({ message: "Something went wrong!" }));
    }
  } finally {
    res.end();
  }
});

server.listen(80, "0.0.0.0", () => {
  console.log("Listening on", server.address());
});

function parseBody<T>(stream: Readable): Promise<T> {
  return new Promise<string>((resolve, reject) => {
    let buffer = "";
    stream
      .on("data", chunk => (buffer += chunk.toString("utf-8")))
      .on("error", reject)
      .on("close", () => resolve(buffer));
  }).then(JSON.parse);
}
