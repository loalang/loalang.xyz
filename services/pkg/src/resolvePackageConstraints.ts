import { database } from "./collaborators";
import semver from "semver";

export interface ResolvedVersion {
  package: string;
  version: string;
}

export default async function resolvePackageConstraints(constraints: {
  [name: string]: string;
}): Promise<ResolvedVersion[]> {
  const allVersions = await database.query<{ name: string; version: string }>(
    `
      select name, version
        from packages
        inner join versions using(id)
      where
        name in $1
    `,
    [Object.keys(constraints)]
  );

  const versionsByPackage = new Map<string, string[]>();
  for (const name in constraints) {
    if (constraints.hasOwnProperty(name)) {
      versionsByPackage.set(name, []);
    }
  }

  for (const { name, version } of allVersions.rows) {
    if (!versionsByPackage.has(name)) {
      versionsByPackage.set(name, []);
    }
    versionsByPackage.get(name)!.push(version);
  }

  const resolved = [];

  for (const [name, versions] of versionsByPackage) {
    const version = findLatestVersionWithinConstraint(
      versions,
      constraints[name]
    );

    if (version == null) {
      throw new Error(
        `No version of ${name} matching ${constraints[name] || "<any>"}`
      );
    }

    resolved.push({ package: name, version });
  }

  return resolved;
}

function findLatestVersionWithinConstraint(
  availableVersions: string[],
  constraint: string | undefined
): string | null {
  availableVersions.sort(semver.compare).reverse();

  if (constraint == null) {
    return availableVersions[0] || null;
  }

  for (const version of availableVersions) {
    if (semver.satisfies(version, constraint)) {
      return version;
    }
  }

  return null;
}
