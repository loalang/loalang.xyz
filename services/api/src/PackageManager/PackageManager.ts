import PackageManagerPackage from "./PackageManagerPackage";

export default class PackageManager {
  constructor(private _host: string) {}

  static create() {
    return new PackageManager(process.env.PKG_HOST || "http://localhost:8087");
  }

  async find(name: string): Promise<PackageManagerPackage | null> {
    const response = await fetch(`${this._host}/packages/${name}`);
    const pkg = await response.json();
    return new PackageManagerPackage(pkg);
  }
}
