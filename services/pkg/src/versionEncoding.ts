import { SemVer, parse } from "semver";

// Each part of the version takes up 15 bits
export const VERSION_PART_SIZE = 10;

// 0000 0000 1111
const PATCH_MASK = (1 << VERSION_PART_SIZE) - 1;

// 0000 1111 0000
const MINOR_MASK = PATCH_MASK << VERSION_PART_SIZE;

// 1111 0000 0000
const MAJOR_MASK = MINOR_MASK << VERSION_PART_SIZE;

export function decode({
  version,
  prerelease
}: {
  version: number | null;
  prerelease?: string | null | undefined;
}): SemVer {
  if (version == null || version === 0) {
    return parse(`0.0.0${prerelease == null ? "" : `-${prerelease}`}`)!;
  }

  const major = (MAJOR_MASK & version) >> (VERSION_PART_SIZE * 2);
  const minor = (MINOR_MASK & version) >> (VERSION_PART_SIZE * 1);
  const patch = (PATCH_MASK & version) >> (VERSION_PART_SIZE * 0);

  return parse(
    `${major}.${minor}.${patch}${prerelease == null ? "" : `-${prerelease}`}`
  )!;
}

export function encode(
  version: SemVer
): { version: number; prerelease: string | null } {
  const majorPart = version.major << (VERSION_PART_SIZE * 2);
  const minorPart = version.minor << (VERSION_PART_SIZE * 1);
  const patchPart = version.patch << (VERSION_PART_SIZE * 0);

  const versionNumber = majorPart | minorPart | patchPart;

  return {
    version: versionNumber,
    prerelease: version.prerelease.join(".") || null
  };
}
