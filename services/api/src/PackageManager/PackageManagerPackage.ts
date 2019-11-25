import Package, { PackageVersion } from "../Resolvers/Package";

export default class PackageManagerPackage extends Package {
  constructor(private _registry: any) {
    super();
  }

  async name() {
    return this._registry.name;
  }

  async versions(): Promise<PackageVersion[]> {
    return this._registry.versions.map((version: any) => ({
      package: this,
      version: version.version,
      url: version.url
    }));
  }
}
