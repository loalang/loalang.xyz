import Publication from "./Publication";
import HttpError from "./HttpError";
import uuid from "uuid/v4";
import { database, bucket, topic } from "./collaborators";
import Package from "./Package";

export default async function publish(
  publication: Publication
): Promise<Package> {
  let client = await database.connect();
  try {
    const existingVersions = await client.query<{
      id: string;
      version: string;
      url: string;
      published: Date;
    }>(
      `
        select id, version, url, published from packages
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
    const insertResult = await client.query<{ published: Date }>(
      "insert into versions(id, version, url) values($1, $2, $3) returning published",
      [id, publication.version, url]
    );
    await topic.publishJSON({
      id,
      name: publication.name,
      version: publication.version,
      url
    });
    return {
      id,
      name: publication.name,
      versions: existingVersions.rows
        .map(existing => ({
          version: existing.version,
          url: existing.url,
          published: existing.published
        }))
        .concat({
          version: publication.version,
          url,
          published: insertResult.rows[0].published
        })
    };
  } finally {
    await client.release();
  }
}