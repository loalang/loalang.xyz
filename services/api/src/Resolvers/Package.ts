import { compare } from "semver";

export default abstract class Package {
  abstract name(): Promise<string>;
  abstract versions(): Promise<PackageVersion[]>;

  async version({
    exact
  }: {
    exact: string;
  }): Promise<PackageVersion | undefined> {
    return (await this.versions()).find(version => version.version === exact);
  }

  async latestVersion(): Promise<PackageVersion> {
    const versions = await this.versions();

    versions.sort((a, b) => compare(a.version, b.version)).reverse();

    return versions[0];
  }
}

export interface PackageVersion {
  package: Package;
  version: string;
  url: string;
}
