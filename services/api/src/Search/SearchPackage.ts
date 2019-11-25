import Package, { PackageVersion } from "../Resolvers/Package";

export default class SearchPackage extends Package {
  readonly _name: string;

  constructor({ name }: { name: string }) {
    super();

    this._name = name;
  }

  async name() {
    return this._name;
  }

  async versions(): Promise<PackageVersion[]> {
    throw new Error("Unimplemented");
  }
}
