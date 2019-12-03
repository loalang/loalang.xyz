import { database } from "./collaborators";
import semver from "semver";

export interface ResolvedVersion {
  package: string;
  version: string;
}

export default async function resolvePackageConstraints(constraints: {
  [name: string]: string;
}): Promise<ResolvedVersion[]> {
  const versionsByPackage = new Map<string, string[]>();
  for (const name in constraints) {
    if (constraints.hasOwnProperty(name)) {
      versionsByPackage.set(name, []);
    }
  }

  return [];
}
