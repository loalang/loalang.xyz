import { database } from "./collaborators";
import { SemVer } from "semver";
import {
  Path,
  PackageNode,
  HASEdge,
  ReleaseNode,
  DEPENDS_ONEdge,
  Node,
  Relationship
} from "./Schema";
import { decode } from "./versionEncoding";

export interface ResolvedVersion {
  package: string;
  version: SemVer;
}

export default function resolvePackageConstraints(constraints: {
  [name: string]: string;
}): Promise<ResolvedVersion[]> {
  return database.session(async session => {
    const deps = await session.query<{
      path: Path<PackageNode | ReleaseNode, DEPENDS_ONEdge | HASEdge>;
    }>`
      MATCH (directDependency:Package)
      WHERE directDependency.name IN ${Object.keys(constraints)}
      CALL apoc.path.expandConfig(directDependency, {
        uniqueness: 'NODE_GLOBAL',
        relationshipFilter: 'HAS>, DEPENDS_ON>'
      })
      YIELD path AS path
      RETURN path
    `;
    const allSegments = deps.flatMap(({ path }) => path.segments);

    // TODO: Implement an algorithm for actually resolving this

    const packages = new Map<string, SemVer>();

    for (const { start, relationship, end } of allSegments) {
      if (
        Node.is<PackageNode>(start, "Package") &&
        Relationship.is<HASEdge>(relationship, "HAS") &&
        Node.is<ReleaseNode>(end, "Release")
      ) {
        packages.set(start.properties.name, decode(end.properties));
      }
    }

    return Array.from(packages, ([name, version]) => ({
      package: name,
      version
    }));
  });
}
