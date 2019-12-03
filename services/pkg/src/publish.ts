import Publication from "./Publication";
import HttpError from "./HttpError";
import uuid from "uuid/v4";
import { database, notifier, storage } from "./collaborators";
import Package, { PackageVersion } from "./Package";
import { decode, encode } from "./versionEncoding";
import { DateTime, now } from "./DateTime";

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

    const existingVersions = await session.query<{
      id: string;
      packageId: string;
      url: string;
      checksum: string;
      publishedAt: DateTime;
      publisher: string;

      version: number | null;
      prerelease: string | null;
    }>`
      MATCH (package:Package{ name: ${publication.name} })-[:HAS]->(release:Release)<-[published:PUBLISHED]-(publisher:Publisher)
      RETURN
        release.id AS id,
        package.id AS packageId,
        release.url AS url,
        release.checksum AS checksum,
        published.at AS publishedAt,
        publisher.id AS publisher,
        release.version AS version,
        release.prerelease AS prerelease
    `;

    const existing = existingVersions.map(({ version, prerelease, ...ex }) => {
      return {
        ...ex,
        version: decode({ version, prerelease })
      };
    });

    for (const { version } of existing) {
      if (version.compare(publication.version) === 0) {
        throw new HttpError(
          400,
          `Version ${version} or ${publication.name} is already published`
        );
      }
    }

    let id: string;
    if (existingVersions.length === 0) {
      id = uuid();
      await session.query`
        CREATE (:Package{ id: ${id}, name: ${publication.name} })
      `;
    } else {
      id = existingVersions[0].id;
    }

    const url = await storage.storePublication(id, publication);

    const releaseId = uuid();
    const publishedAt = now();
    const releaseVersion = encode(publication.version);
    await session.query`
      MATCH (p:Package{ id: ${id} }),
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
        id,
        publication.name,
        publication.version.format(),
        url
      )
      .catch(err => {
        console.error(err);
      });

    const versions: PackageVersion[] = existing
      .map(ex => ({
        id: ex.id,
        version: ex.version,
        url: ex.url,
        checksum: ex.checksum,
        publishedAt: ex.publishedAt,
        publisher: ex.publisher
      }))
      .concat({
        id: releaseId,
        version: publication.version,
        url,
        checksum: publication.checksum,
        publishedAt,
        publisher: publication.publisherId
      });

    return {
      id,
      name: publication.name,
      versions
    };
  });
}
