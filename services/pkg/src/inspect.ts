import Package, { PackageVersion } from "./Package";
import { database } from "./collaborators";

export async function inspectPackage(name: string): Promise<Package | null> {
  const client = await database.connect();
  try {
    const result = await client.query<{
      id: string;
      name: string;
      version: string;
      url: string;
      published: Date;
    }>(
      `
        select id, name, version, url, published from packages
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
        published: row.published
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
