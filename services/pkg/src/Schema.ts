import { DateTime } from "./DateTime";
import Integer from "./Integer";
import { SemVer } from "semver";
import { decode } from "./versionEncoding";

export interface Path<N, R> {
  length: Integer;
  start: N;
  segments: PathSegment<N, R>;
  end: N;
}

export interface PathSegment<N, R> {
  start: N;
  relationship: R;
  end: N;
}

export type Node<T> = {
  identity: Integer;
  properties: T;
  labels: string[];
};

export namespace Node {
  export function is<T extends Node<any>>(
    node: Node<any>,
    label: string
  ): node is T {
    return node.labels.includes(label);
  }
}

export type Relationship<T> = {
  identity: Integer;
  properties: T;
  start: Integer;
  end: Integer;
  type: string;
};

export namespace Relationship {
  export function is<T extends Relationship<any>>(
    node: Relationship<any>,
    type: string
  ): node is T {
    return node.type === type;
  }
}

export type PackageNode = Node<{
  id: string;
  name: string;
}>;

export type HASEdge = Relationship<{}>;

export type ReleaseNode = Node<{
  id: string;
  version: Integer;
  prerelease: string | null;
  url: string;
  checksum: string;
}>;

export type DEPENDS_ONEdge = Relationship<{
  minVersion: Integer;
  minPrerelease?: string;
  maxVersion: Integer;
  maxPrerelease?: string;
  development: boolean;
}>;

export function collectDependencies(
  dependencies: ([DEPENDS_ONEdge, PackageNode] | [null, null])[],
  { development: devDeps }: { development: boolean } = { development: false }
): { [name: string]: SemVer } {
  return dependencies
    .filter(
      (x): x is [DEPENDS_ONEdge, PackageNode] => x[0] != null && x[1] != null
    )
    .reduce(
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

export type PUBLISHEDEdge = Relationship<{
  at: DateTime;
}>;

export type PublisherNode = Node<{
  id: string;
}>;
