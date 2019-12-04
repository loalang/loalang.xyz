import { SemVer, parse } from "semver";
import Integer from "./Integer";

// Each part of the version takes up 15 bits
export const VERSION_PART_SIZE = Integer.fromInt(21);

// 0000 0000 1111
const PATCH_MASK = Integer.fromInt(1)
  .shiftLeft(VERSION_PART_SIZE)
  .subtract(1);

// 0000 1111 0000
const MINOR_MASK = PATCH_MASK.shiftLeft(VERSION_PART_SIZE);

// 1111 0000 0000
const MAJOR_MASK = MINOR_MASK.shiftLeft(VERSION_PART_SIZE);

export function decode({
  version,
  prerelease
}: {
  version: Integer | number | null;
  prerelease?: string | null | undefined;
}): SemVer {
  if (typeof version === "number") {
    version = Integer.fromInt(version);
  }

  if (version == null || version.isZero()) {
    return parse(`0.0.0${prerelease == null ? "" : `-${prerelease}`}`)!;
  }

  const major = MAJOR_MASK.and(version).shiftRight(
    VERSION_PART_SIZE.multiply(2)
  );
  const minor = MINOR_MASK.and(version).shiftRight(
    VERSION_PART_SIZE.multiply(1)
  );
  const patch = PATCH_MASK.and(version).shiftRight(
    VERSION_PART_SIZE.multiply(0)
  );

  return parse(
    `${major}.${minor}.${patch}${prerelease == null ? "" : `-${prerelease}`}`
  )!;
}

export function encode(
  version: SemVer
): { version: Integer; prerelease: string | null } {
  const majorPart = Integer.fromInt(version.major).shiftLeft(
    VERSION_PART_SIZE.multiply(2)
  );
  const minorPart = Integer.fromInt(version.minor).shiftLeft(
    VERSION_PART_SIZE.multiply(1)
  );
  const patchPart = Integer.fromInt(version.patch).shiftLeft(
    VERSION_PART_SIZE.multiply(0)
  );

  const versionNumber = majorPart.or(minorPart).or(patchPart);

  return {
    version: versionNumber,
    prerelease: version.prerelease.join(".") || null
  };
}
