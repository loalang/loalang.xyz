import Publication from "./Publication";
import HttpError from "./HttpError";
import uuid from "uuid/v4";
import { database, notifier, storage } from "./collaborators";
import Package, { PackageVersion } from "./Package";
import { decode, encode } from "./versionEncoding";
import { DateTime, now } from "./DateTime";
import {
  PackageNode,
  ReleaseNode,
  PUBLISHEDEdge,
  PublisherNode,
  collectDependencies,
  DEPENDS_ONEdge
} from "./Schema";
import { SemVer } from "semver";

export default function publish(publication: Publication): Promise<Package> {
  return database.session(async session => {
    const rootNamespace = publication.name.split("/").shift()!;

    const owners = await session.query<{ id: string }>`
      MATCH (:RootNamespace{ name: ${rootNamespace} })<-[:OWNS]-(owner:Publisher)
      RETURN owner.id AS id
    `;

    if (
      owners.length > 0 &&
      !owners.map(o => o.id).includes(publication.publisherId)
    ) {
      throw new HttpError(
        403,
        `User not authorized to publish to root namespace ${rootNamespace}`
      );
    } else if (owners.length === 0) {
      // Publisher has claimed the root namespace
      await session.query`
        MERGE (:RootNamespace{ name: ${rootNamespace} })<-[:OWNS]-(:Publisher{ id: ${publication.publisherId} })
      `;
    }

    const existingReleases = (
      await session.query<{
        package: PackageNode;
        release: ReleaseNode;
        published: PUBLISHEDEdge;
        publisher: PublisherNode;
        dependencies: [DEPENDS_ONEdge, PackageNode][];
      }>`
      MATCH (package:Package{ name: ${publication.name} })-[:HAS]->(release:Release)<-[published:PUBLISHED]-(publisher:Publisher)
      OPTIONAL MATCH (release)-[dep:DEPENDS_ON]-(dependency:Package)
      RETURN
        package,
        release,
        published,
        publisher,
        collect([dep, dependency]) AS dependencies
    `
    ).map(ex => {
      return {
        ...ex,
        version: decode(ex.release.properties)
      };
    });

    for (const { version } of existingReleases) {
      if (version.compare(publication.version) === 0) {
        throw new HttpError(
          400,
          `Version ${version} or ${publication.name} is already published`
        );
      }
    }

    console.log(existingReleases);

    let packageId: string;
    if (existingReleases.length === 0) {
      packageId = uuid();
      await session.query`
        CREATE (:Package{ id: ${packageId}, name: ${publication.name} })
      `;
    } else {
      packageId = existingReleases[0].package.properties.id;
    }

    const url = await storage.storePublication(packageId, publication);

    const releaseId = uuid();
    const publishedAt = now();
    const releaseVersion = encode(publication.version);
    await session.query`
      MATCH (p:Package{ id: ${packageId} }),
            (publisher:Publisher{ id: ${publication.publisherId} })
      CREATE (p)-[:HAS]->(r:Release{
        id: ${releaseId},
        checksum: ${publication.checksum},
        url: ${url},
        version: ${releaseVersion.version},
        prerelease: ${releaseVersion.prerelease}
      })<-[:PUBLISHED{ at: ${publishedAt} }]-(publisher)
    `;

    for (const dep of publication.dependencies) {
      const { version, prerelease } = encode(dep.version);

      await session.query`
        MATCH
          (dependent:Release{ id: ${releaseId} }),
          (dependency:Package{ name: ${dep.package} })
        CREATE (dependent)-[:DEPENDS_ON{
          minVersion: ${version},
          minPrerelease: ${prerelease},
          maxVersion: ${version},
          maxPrerelease: ${prerelease},
          development: ${dep.development}
        }]->(dependency)
      `;
    }

    await notifier
      .notifyPackagePublished(
        packageId,
        publication.name,
        publication.version.format(),
        url
      )
      .catch(err => {
        console.error(err);
      });

    const versions: PackageVersion[] = existingReleases
      .map(({ version, release, published, publisher, dependencies }) => ({
        id: release.properties.id,
        version,
        url: release.properties.url,
        checksum: release.properties.checksum,
        publishedAt: published.properties.at,
        publisher: publisher.properties.id,
        dependencies: collectDependencies(dependencies)
      }))
      .concat({
        id: releaseId,
        version: publication.version,
        url,
        checksum: publication.checksum,
        publishedAt,
        publisher: publication.publisherId,
        dependencies: publication.dependencies.reduce(
          (dependencies, { version, development, package: name }) => {
            if (!development) {
              dependencies[name] = version;
            }
            return dependencies;
          },
          {} as { [name: string]: SemVer }
        )
      });

    return {
      id: packageId,
      name: publication.name,
      versions
    };
  });
}
