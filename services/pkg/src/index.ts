import http from "http";
import HttpError from "./HttpError";
import { Readable } from "stream";
import { parse } from "./Publication";
import publish from "./publish";

const server = http.createServer(async (req, res) => {
  try {
    res.setHeader("Content-Type", "application/json");

    const url = new URL(`http://incoming${req.url}`);
    switch (`${req.method} ${url.pathname}`) {
      case "PUT /publish":
        const url = await publish(await parse(req));

        res.writeHead(201);
        res.write(JSON.stringify({ message: "Success", url }));
        break;

      default:
        res.writeHead(404);
        res.write(JSON.stringify({ message: "Not Found" }));
        break;
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

server.listen(Number(process.env.PORT || 8087), "0.0.0.0", () => {
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
