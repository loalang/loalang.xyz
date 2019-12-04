import http from "http";
import HttpError from "./HttpError";
import { Readable } from "stream";
import { parse } from "./Publication";
import publish from "./publish";
import { inspectPackage, inspectVersion, inspectPublisher } from "./inspect";
import resolvePackageConstraints from "./resolvePackageConstraints";
import { SemVer } from "semver";
import { DateTime } from "./DateTime";

const server = http.createServer(async (req, res) => {
  try {
    res.setHeader("Content-Type", "application/json");

    const url = new URL(`http://incoming${req.url}`);
    const header = `${req.method} ${url.pathname}`;
    let match: RegExpExecArray | null;
    if ((match = /^GET \/healthz$/.exec(header))) {
      res.writeHead(200);
      res.write(encodeJSON({ message: "OK" }));
    } else if ((match = /^PUT \/packages\/(.*)$/.exec(header))) {
      const name = decodeURIComponent(match[1]);
      const version = url.searchParams.get("version");
      const pkg = await publish(await parse(name, version, req));

      res.writeHead(201);
      res.write(encodeJSON({ message: "OK", package: pkg }));
    } else if ((match = /^GET \/packages\/(.+)$/.exec(header))) {
      const name = decodeURIComponent(match[1]);
      const version = url.searchParams.get("version");

      const result =
        version == null
          ? await inspectPackage(name)
          : await inspectVersion(name, version);

      if (result == null) {
        res.writeHead(404);
        res.write(encodeJSON({ message: "Not Found" }));
      } else if (version == null) {
        res.writeHead(200);
        res.write(encodeJSON({ message: "OK", package: result }));
      } else {
        res.writeHead(200);
        res.write(encodeJSON({ message: "OK", version: result }));
      }
    } else if ((match = /^GET \/publishers\/([^/]+)$/.exec(header))) {
      const publisherId = match[1];

      const publisher = await inspectPublisher(publisherId);

      if (publisher == null) {
        res.writeHead(404);
        res.write(encodeJSON({ message: "Not Found" }));
      } else {
        res.writeHead(200);
        res.write(encodeJSON({ message: "OK", publisher }));
      }
    } else if ((match = /^POST \/resolve$/.exec(header))) {
      const resolved = await resolvePackageConstraints(
        await parseJSON<{ [name: string]: string }>(req)
      );

      res.writeHead(200);
      res.write(encodeJSON({ message: "OK", resolved }));
    } else {
      res.writeHead(404);
      res.write(encodeJSON({ message: "Not Found" }));
    }
  } catch (e) {
    if (e instanceof HttpError) {
      res.writeHead(e.statusCode);
      res.write(encodeJSON({ message: e.message }));
    } else {
      console.error(e);
      res.writeHead(500);
      res.write(encodeJSON({ message: "Something went wrong!" }));
    }
  } finally {
    res.end();
  }
});

server.listen(80, "0.0.0.0", () => {
  console.log("Started!");
});

function encodeJSON(value: any): string {
  return JSON.stringify(value, (_, value) => {
    if (value instanceof SemVer) {
      return value.format();
    }
    if (value instanceof DateTime) {
      return value.toString();
    }
    return value;
  });
}

function parseJSON<T>(stream: Readable): Promise<T> {
  return new Promise<string>((resolve, reject) => {
    let buffer = "";
    stream
      .on("data", c => (buffer += c.toString("utf-8")))
      .once("error", reject)
      .once("end", () => resolve(buffer));
  }).then(JSON.parse);
}
