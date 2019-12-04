import { Readable } from "stream";
import { IncomingMessage } from "http";
import HttpError from "./HttpError";
import { SemVer, parse as parseVersion } from "semver";

export default interface Publication {
  name: string;
  version: SemVer;
  publisherId: string;
  checksum: string;
  tarball: Readable;
  dependencies: Dependency[];
}

export interface Dependency {
  package: string;
  development: boolean;
  version: SemVer;
}

export function parse(
  name: string,
  version: string | null,
  req: IncomingMessage
): Publication {
  if (req.headers["content-type"] !== "application/tar+gzip") {
    throw new HttpError(400, "Required Content-Type: application/tar+gzip");
  }

  const publisherId = req.headers["x-publisher-id"];
  if (publisherId == null) {
    throw new HttpError(400, "Required X-Publisher-Id to be set");
  }
  if (Array.isArray(publisherId)) {
    throw new HttpError(400, "Cannot publish as multiple publishers");
  }

  const checksum = req.headers["x-checksum"];
  if (checksum == null) {
    throw new HttpError(400, "Required X-Checksum to be set");
  }
  if (Array.isArray(checksum)) {
    throw new HttpError(400, "Only provide one checksum");
  }

  if (typeof version !== "string") {
    throw new HttpError(400, "Required query param: version");
  }

  const semver = parseVersion(version);

  if (semver == null) {
    throw new HttpError(400, "Invalid version string");
  }

  let dependencies: Dependency[] = [];

  const dependencyHeaders = req.headers["x-dependency"];
  if (typeof dependencyHeaders === "string") {
    dependencies.push(...parseDependencyHeader(dependencyHeaders));
  } else if (dependencyHeaders != null) {
    for (const dependencyHeader of dependencyHeaders) {
      dependencies.push(...parseDependencyHeader(dependencyHeader));
    }
  }

  return {
    name,
    version: semver,
    checksum,
    publisherId,
    tarball: req,
    dependencies
  };
}

export function parseDependencyHeader(header: string): Dependency[] {
  return header.split(/\s*,\s*/g).map(header => {
    const match = /^([^=\s]+)\s*(?:=\s*(\d+))?(?:\.(\d+))?(?:\.(\d+))?(?:-(.+?))?\s*(?:;\s*(dev))?\s*;?\s*$/.exec(
      header
    );

    if (match == null) {
      throw new HttpError(400, `Invalid dependency header: ${header}`);
    }

    const name = match[1];
    const major: string | undefined = match[2];
    const minor: string | undefined = match[3];
    const patch: string | undefined = match[4];
    const prerelease: string | undefined = match[5];
    const devFlag: string | undefined = match[6];

    return {
      package: name,
      development: typeof devFlag === "string",
      version: parseVersion(
        `${major || 0}.${minor || 0}.${patch || 0}${
          prerelease ? `-${prerelease}` : ""
        }`
      )!
    };
  });
}
