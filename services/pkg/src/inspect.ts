import Package, { PackageVersion } from "./Package";
import { database } from "./collaborators";
import Publisher from "./Publisher";
import { decode } from "./versionEncoding";
import { DateTime } from "./DateTime";

export function inspectPackage(name: string): Promise<Package | null> {
  return database.session(async session => {
    const result = await session.query<{
      id: string;
      packageId: string;
      name: string;
      url: string;
      checksum: string;
      publishedAt: DateTime;
      publisher: string;

      version: number | null;
      prerelease: string | null;
    }>`
      MATCH (package:Package{ name: ${name} })-[:HAS]->(release:Release)<-[published:PUBLISHED]-(publisher:Publisher)
      RETURN
        release.id AS id,
        package.id AS packageId,
        package.name AS name,
        release.url AS url,
        release.checksum AS checksum,
        published.at AS publishedAt,
        publisher.id AS publisher,
        release.version AS version,
        release.prerelease AS prerelease
    `;

    if (result.length === 0) {
      return null;
    }

    return {
      id: result[0].packageId,
      name: result[0].name,
      versions: result.map(row => ({
        id: row.id,
        version: decode({
          version: row.version,
          prerelease: row.prerelease
        }),
        url: row.url,
        checksum: row.checksum,
        publishedAt: row.publishedAt,
        publisher: row.publisher
      }))
    };
  });
}

export async function inspectVersion(
  name: string,
  version: string
): Promise<PackageVersion | null> {
  return null;
}

export function inspectPublisher(id: string): Promise<Publisher | null> {
  return database.session(async session => {
    const packageVersions = await session.query<{
      id: string;
      packageId: string;
      name: string;
      url: string;
      checksum: string;
      publishedAt: DateTime;
      publisher: string;

      version: number | null;
      prerelease: string | null;
    }>`
      MATCH (publisher:Publisher{ id: ${id} })-[published:PUBLISHED]->(release:Release)<-[:HAS]-(package:Package)
      RETURN
        release.id AS id,
        package.id AS packageId,
        package.name AS name,
        release.url AS url,
        release.checksum AS checksum,
        published.at AS publishedAt,
        publisher.id AS publisher,
        release.version AS version,
        release.prerelease AS prerelease
    `;

    return {
      id,
      packages: Array.from(
        packageVersions
          .reduce(
            (
              packages,
              {
                packageId,
                id,
                name,
                url,
                publishedAt,
                version,
                prerelease,
                publisher,
                checksum
              }
            ) => {
              const pkg = packages.get(packageId) || {
                id: packageId,
                name,
                versions: []
              };

              pkg.versions.push({
                id,
                url,
                publishedAt,
                version: decode({ version, prerelease }),
                checksum: checksum,
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
  });
}
