import PackageManager from "../PackageManager/PackageManager";
import Package from "./Package";

export default {
  Query: {
    async package(
      _: any,
      { name }: { name: string },
      { pkg }: { pkg: PackageManager }
    ): Promise<Package | null> {
      return pkg.find(name);
    }
  }
};
