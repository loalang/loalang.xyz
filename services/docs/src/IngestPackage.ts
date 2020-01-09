import { Database, ClassDoc } from "./Database";
import { PackagePublishedEvent } from "./Queue";
import * as tar from "tar";
import { IncomingMessage } from "http";
import * as https from "https";
import { Readable, Writable } from "stream";

const DOCS_JSON_FILE_PATH_IN_ARCHIVE = ".docs.json";

function extractDocs(
  tarStream: Readable
): Promise<{ classes: Record<string, ClassDoc> }> {
  return new Promise<string>((resolve, reject) => {
    tarStream
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
}

export default class IngestPackage {
  constructor(private readonly _database: Database) {}

  async ingest({ url }: PackagePublishedEvent) {
    const request = https.get(url);
    request.end();
    const response = await new Promise<IncomingMessage>((resolve, reject) => {
      request.once("error", reject).once("response", resolve);
    });

    const { classes } = await extractDocs(response);

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
