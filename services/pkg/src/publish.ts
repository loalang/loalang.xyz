import Publication from "./Publication";
import HttpError from "./HttpError";
import uuid from "uuid/v4";
import { database, notifier, storage } from "./collaborators";
import Package from "./Package";

export default async function publish(
  publication: Publication
): Promise<Package> {
  let client = await database.connect();
  try {
    const rootNamespace = publication.name.split("/").shift()!;
    const owners = await database.query<{ owner_id: string }>(
      `
        select owner_id from root_namespace_owners
        where root_namespace = $1
      `,
      [rootNamespace]
    );

    if (
      owners.rowCount > 0 &&
      !owners.rows.map(o => o.owner_id).includes(publication.publisherId)
    ) {
      throw new HttpError(
        403,
        `User not authorized to publish to root namespace ${rootNamespace}`
      );
    } else if (owners.rowCount === 0) {
      // Publisher has claimed the root namespace
      await client.query(
        `
          insert into root_namespace_owners(root_namespace, owner_id) values($1, $2)
        `,
        [rootNamespace, publication.publisherId]
      );
    }

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

    const url = await storage.storePublication(publication);

    const insertResult = await client.query<{ published: Date }>(
      "insert into versions(id, version, url, publisher) values($1, $2, $3, $4) returning published",
      [id, publication.version, url, publication.publisherId]
    );
    await notifier
      .notifyPackagePublished(id, publication.name, publication.version, url)
      .catch(err => {
        console.error(err);
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
