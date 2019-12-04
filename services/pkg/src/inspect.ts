import Package, { PackageVersion } from "./Package";
import { database } from "./collaborators";
import Publisher from "./Publisher";
import { decode } from "./versionEncoding";
import {
  PackageNode,
  ReleaseNode,
  PUBLISHEDEdge,
  PublisherNode,
  DEPENDS_ONEdge,
  collectDependencies
} from "./Schema";
import { SemVer } from "semver";

export function inspectPackage(name: string): Promise<Package | null> {
  return database.session(async session => {
    const result = await session.query<{
      package: PackageNode;
      release: ReleaseNode;
      published: PUBLISHEDEdge;
      publisher: PublisherNode;
      dependencies: [DEPENDS_ONEdge, PackageNode][];
    }>`
      MATCH
        (package:Package{ name: ${name} })-[:HAS]->(release:Release)<-[published:PUBLISHED]-(publisher:Publisher)
      OPTIONAL MATCH (release)-[dep:DEPENDS_ON]-(dependency:Package)
      RETURN
        package,
        release,
        published,
        publisher,
        collect([dep, dependency]) AS dependencies
    `;

    if (result.length === 0) {
      return null;
    }

    return {
      id: result[0].package.properties.id,
      name: result[0].package.properties.name,
      versions: result.map(row => ({
        id: row.release.properties.id,
        version: decode(row.release.properties),
        url: row.release.properties.url,
        checksum: row.release.properties.checksum,
        publishedAt: row.published.properties.at,
        publisher: row.publisher.properties.id,
        dependencies: collectDependencies(row.dependencies)
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
      package: PackageNode;
      release: ReleaseNode;
      published: PUBLISHEDEdge;
      publisher: PublisherNode;
      dependencies: [DEPENDS_ONEdge, PackageNode][];
    }>`
      MATCH (publisher:Publisher{ id: ${id} })-[published:PUBLISHED]->(release:Release)<-[:HAS]-(package:Package)
      OPTIONAL MATCH (release)-[dep:DEPENDS_ON]-(dependency:Package)
      RETURN
      package,
      release,
      published,
      publisher,
      collect([dep, dependency]) AS dependencies
    `;

    return {
      id,
      packages: Array.from(
        packageVersions
          .reduce(
            (
              packages,
              { package: p, release, published, publisher, dependencies }
            ) => {
              const pkg = packages.get(p.properties.id) || {
                id: p.properties.id,
                name: p.properties.name,
                versions: []
              };

              pkg.versions.push({
                id: release.properties.id,
                url: release.properties.url,
                publishedAt: published.properties.at,
                version: decode(release.properties),
                checksum: release.properties.checksum,
                publisher: publisher.properties.id,
                dependencies: collectDependencies(dependencies)
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
