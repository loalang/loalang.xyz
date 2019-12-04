import { DateTime } from "./DateTime";
import Integer from "./Integer";
import { SemVer } from "semver";
import { decode } from "./versionEncoding";

export type WithProps<T> = { properties: T };

export type PackageNode = WithProps<{
  id: string;
  name: string;
}>;

export type HASEdge = WithProps<{}>;

export type ReleaseNode = WithProps<{
  id: string;
  version: Integer;
  prerelease: string | null;
  url: string;
  checksum: string;
}>;

export type DEPENDS_ONEdge = WithProps<{
  minVersion: Integer;
  minPrerelease?: string;
  maxVersion: Integer;
  maxPrerelease?: string;
  development: boolean;
}>;

export function collectDependencies(
  dependencies: [DEPENDS_ONEdge, PackageNode][],
  { development: devDeps }: { development: boolean } = { development: false }
): { [name: string]: SemVer } {
  return dependencies.reduce(
    (
      dependencies,
      [
        {
          properties: { minVersion, minPrerelease, development }
        },
        {
          properties: { name }
        }
      ]
    ) => {
      if (devDeps === development) {
        dependencies[name] = decode({
          version: minVersion,
          prerelease: minPrerelease
        });
      }
      return dependencies;
    },
    {} as { [name: string]: SemVer }
  );
}

export type PUBLISHEDEdge = WithProps<{
  at: DateTime;
}>;

export type PublisherNode = WithProps<{
  id: string;
}>;
