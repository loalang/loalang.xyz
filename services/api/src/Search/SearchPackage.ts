import Package, { PackageVersion } from "../Resolvers/Package";
import Context from "../Context";
import PackageManagerPackage from "../PackageManager/PackageManagerPackage";
import PackageManager from "../PackageManager/PackageManager";

export default class SearchPackage extends Package {
  readonly _id: string;
  readonly _name: string;

  _lazyPackage: PackageManagerPackage | null | undefined;

  constructor({ name, id }: { name: string; id: string }) {
    super();

    this._id = id;
    this._name = name;
  }

  async id() {
    return this._id;
  }

  async name() {
    return this._name;
  }

  async versions(_: {}, { pkg }: Context): Promise<PackageVersion[]> {
    const found = await this._package(pkg);

    if (found == null) {
      return [];
    }

    return found.versions();
  }

  private async _package(
    pkg: PackageManager
  ): Promise<PackageManagerPackage | null> {
    if (this._lazyPackage === undefined) {
      this._lazyPackage = await pkg.find(this._name);
    }
    return this._lazyPackage;
  }
}
