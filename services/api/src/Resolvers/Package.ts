import { compare } from "semver";
import Context from "../Context";

export default abstract class Package {
  abstract id(): Promise<string>;
  abstract name(): Promise<string>;
  abstract versions(_: {}, context: Context): Promise<PackageVersion[]>;

  async version(
    {
      exact
    }: {
      exact: string;
    },
    context: Context
  ): Promise<PackageVersion | undefined> {
    return (await this.versions({}, context)).find(
      version => version.version === exact
    );
  }

  async latestVersion(_: {}, context: Context): Promise<PackageVersion> {
    const versions = await this.versions({}, context);

    versions.sort((a, b) => compare(a.version, b.version)).reverse();

    return versions[0];
  }
}

export interface PackageVersion {
  package: Package;
  version: string;
  url: string;
  checksum: string;
  publishedAt: Date;
}
