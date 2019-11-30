import Package, { PackageVersion } from "./Package";
import { database } from "./collaborators";
import Publisher from "./Publisher";

export async function inspectPackage(name: string): Promise<Package | null> {
  const client = await database.connect();
  try {
    const result = await client.query<{
      id: string;
      name: string;
      version: string;
      url: string;
      checksum: string;
      published: Date;
      publisher: string;
    }>(
      `
        select id, name, version, url, published, publisher, checksum
          from packages
          inner join versions using(id)
        where name = $1
      `,
      [name]
    );

    if (result.rowCount === 0) {
      return null;
    }

    return {
      id: result.rows[0].id,
      name: result.rows[0].name,
      versions: result.rows.map(row => ({
        version: row.version,
        url: row.url,
        checksum: row.checksum,
        published: row.published,
        publisher: row.publisher
      }))
    };
  } finally {
    client.release();
  }
}

export async function inspectVersion(
  name: string,
  version: string
): Promise<PackageVersion | null> {
  const client = await database.connect();
  try {
    return null;
  } finally {
    client.release();
  }
}

export async function inspectPublisher(id: string): Promise<Publisher | null> {
  const client = await database.connect();
  try {
    const packageVersions = await client.query<{
      id: string;
      name: string;
      version: string;
      url: string;
      checksum: Buffer;
      published: Date;
      publisher: string;
    }>(
      `
        with packages_published_by_user as (
          select id, name
          from versions v
          inner join packages using(id)
          where
            v.publisher = $1
          group by id, name
        )
        select *
          from packages_published_by_user
          inner join versions using(id)
      `,
      [id]
    );
    return {
      id,
      packages: Array.from(
        packageVersions.rows
          .reduce(
            (
              packages,
              { id, name, url, published, version, publisher, checksum }
            ) => {
              const pkg = packages.get(id) || { id, name, versions: [] };

              pkg.versions.push({
                url,
                published,
                version,
                checksum: checksum.toString("hex"),
                publisher
              });

              packages.set(id, pkg);
              return packages;
            },
            new Map<string, Package>()
          )
          .values()
      )
    };
  } finally {
    client.release();
  }
}
