import { Database } from "./Database";
import { PackagePublishedEvent } from "./Queue";
import * as fs from "fs";
import * as tar from "tar";
import { IncomingMessage } from "http";
import * as https from "https";
import { promisify } from "util";
import { Readable, Writable } from "stream";

const mkdtemp = promisify(fs.mkdtemp);
const mkdir = promisify(fs.mkdir);
const extract = promisify(tar.extract);
const readFile = promisify(fs.readFile);

const DOCS_JSON_FILE_PATH_IN_ARCHIVE = ".docs.json";

export default class IngestPackage {
  constructor(private readonly _database: Database) {}

  async ingest({ name, url }: PackagePublishedEvent) {
    const request = https.get(url);
    request.end();
    const response = await new Promise<IncomingMessage>((resolve, reject) => {
      request.once("error", reject).once("response", resolve);
    });

    const { classes } = await new Promise<string>((resolve, reject) => {
      response
        .pipe(
          tar.extract(
            {
              onentry(entry) {
                let buffer = "";
                entry
                  .once("error", reject)
                  .on("data", chunk => {
                    buffer += chunk.toString("utf-8");
                  })
                  .once("finish", () => resolve(buffer));
              }
            },
            [DOCS_JSON_FILE_PATH_IN_ARCHIVE]
          )
        )
        .once("error", reject);
    }).then(JSON.parse);

    await Promise.all(
      Object.keys(classes).map(async className => {
        await this._database.saveClass(className, {
          ...classes[className],
          __type: "CLASS"
        });
      })
    );
  }

  _pipe(readable: Readable, writable: Writable) {
    return new Promise((resolve, reject) => {
      readable
        .pipe(writable)
        .once("error", reject)
        .once("finish", resolve);
    });
  }
}
