import Publication from "./Publication";
import { Storage, Bucket } from "@google-cloud/storage";
import { PubSub } from "@google-cloud/pubsub";
import path from "path";
import { Pool } from "pg";
import HttpError from "./HttpError";
import uuid from "uuid/v4";

const database = new Pool({
  host: process.env.POSTGRES_HOST,
  user: process.env.POSTGRES_USER || "postgres",
  password: process.env.POSTGRES_PASS,
  database: process.env.POSTGRES_DATABASE || "postgres"
});

const credentials = require(path.resolve(
  process.env.GOOGLE_APPLICATION_CREDENTIALS || "credentials.json"
));

const pubsub = new PubSub({
  credentials
});
const topic = pubsub.topic("projects/loalang/topics/published-package");
const storage = new Storage({
  credentials
});
const bucket = new Bucket(storage, "loalang-pkg");

export default async function publish(
  publication: Publication
): Promise<string> {
  let client = await database.connect();
  try {
    const existingVersions = await client.query<{
      id: string;
      version: string;
    }>(
      `
        select id, version from packages
        inner join versions using(id)
        where name = $1
      `,
      [publication.name]
    );

    for (const { version } of existingVersions.rows) {
      if (version === publication.version) {
        throw new HttpError(
          400,
          `Version ${version} or ${publication.name} is already published`
        );
      }
    }

    let id;
    if (existingVersions.rowCount === 0) {
      id = uuid();
      await client.query(
        `
          insert into packages(id, name) values($1, $2)
        `,
        [id, publication.name]
      );
    } else {
      id = existingVersions.rows[0].id;
    }

    const file = bucket.file(
      `${publication.name}/${publication.version}.tar.gz`
    );

    if (file.id == null) {
      throw new Error("Id was not generated.");
    }

    await new Promise((resolve, reject) =>
      publication.tarball
        .pipe(file.createWriteStream())
        .on("error", reject)
        .on("finish", resolve)
        .on("close", resolve)
    );

    await file.makePublic();
    const url = `https://storage.googleapis.com/loalang-pkg/${decodeURIComponent(
      file.id
    )}`;
    await client.query(
      "insert into versions(id, version, url) values($1, $2, $3)",
      [id, publication.version, url]
    );
    await topic.publishJSON({
      id,
      name: publication.name,
      version: publication.version,
      url
    });
    return url;
  } finally {
    await client.release();
  }
}
