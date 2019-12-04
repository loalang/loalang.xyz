import { SemVer } from "semver";
import { DateTime } from "./DateTime";

export default interface Package {
  id: string;
  name: string;
  versions: PackageVersion[];
}

export interface PackageVersion {
  id: string;
  version: SemVer;
  url: string;
  publishedAt: DateTime;
  publisher: string;
  checksum: string;
  dependencies: { [name: string]: SemVer };
  devDependencies: { [name: string]: SemVer };
}
