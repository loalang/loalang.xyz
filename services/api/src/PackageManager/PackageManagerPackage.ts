import Package, { PackageVersion } from "../Resolvers/Package";

export default class PackageManagerPackage extends Package {
  constructor(private _registry: any) {
    super();
  }

  async id() {
    return this._registry.id;
  }

  async name() {
    return this._registry.name;
  }

  async versions(): Promise<PackageVersion[]> {
    return (this._registry.versions as any[]).map(version => ({
      package: this,
      version: version.version,
      url: version.url,
      checksum: version.checksum
    }));
  }
}
