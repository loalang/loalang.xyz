import http from "http";
import { ValidationError } from "@hapi/joi";
import Database from "./Database";
import { Readable } from "stream";
import { NotebookPatch } from "./Notebook";

const database = Database.create();

const server = http.createServer(async (req, res) => {
  try {
    res.setHeader("Content-Type", "application/json");

    const url = new URL(`http://incoming${req.url}`);
    const header = `${req.method} ${url.pathname}`;
    let match: RegExpExecArray | null;
    if ((match = /^GET \/healthz$/.exec(header))) {
      await database.checkHealth();
      res.writeHead(200);
      res.write(JSON.stringify({ message: "OK" }));
    } else if ((match = /^POST \/notebooks$/.exec(header))) {
      const { value: patch, error } = NotebookPatch.SCHEMA.validate(
        await parseBody<NotebookPatch>(req)
      );
      if (error != null) {
        throw error;
      }
      const notebook = await database.upsertNotebook(patch);
      res.writeHead(
        notebook.updatedAt.toJSON() === notebook.createdAt.toJSON() ? 201 : 200
      );
      res.write(JSON.stringify({ message: "OK", notebook }));
    } else if ((match = /^GET \/notebooks\/([^/]+)$/.exec(header))) {
      const [, id] = match;
      const notebook = await database.findNotebook(id);
      if (notebook == null) {
        res.writeHead(404);
        res.write(JSON.stringify({ message: "Not Found" }));
      } else {
        res.writeHead(200);
        res.write(JSON.stringify({ message: "OK", notebook }));
      }
    } else {
      res.writeHead(404);
      res.write(JSON.stringify({ message: "Not Found" }));
    }
  } catch (e) {
    if (e?.name === "ValidationError") {
      res.writeHead(400);
      res.write(
        JSON.stringify({ message: "Validation failed!", errors: e.details })
      );
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
  console.log("Started!");
});

function parseBody<T>(stream: Readable): Promise<T> {
  return new Promise<string>((resolve, reject) => {
    let buffer = "";
    stream
      .on("data", chunk => (buffer += chunk.toString("utf-8")))
      .once("end", () => resolve(buffer))
      .once("error", reject);
  }).then(JSON.parse);
}
