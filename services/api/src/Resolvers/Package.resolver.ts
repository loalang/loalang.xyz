import Package, { PackageVersion } from "./Package";
import { FileUpload } from "graphql-upload";
import Context from "../Context";
import { AuthenticationError } from "apollo-server";

interface RequestedPackage {
  name: string;
  version: string;
}

export default {
  Query: {
    async package(
      _: any,
      { name }: { name: string },
      { pkg }: Context
    ): Promise<Package | null> {
      return pkg.find(name);
    },

    async resolvePackages(
      _: any,
      { packages }: { packages: RequestedPackage[] },
      { pkg }: Context
    ): Promise<PackageVersion[]> {
      const resolved = await pkg.resolve(
        packages.reduce(
          (pkgs: { [name: string]: string }, { name, version }) => {
            pkgs[name] = version;
            return pkgs;
          },
          {}
        )
      );

      return Promise.all(
        resolved.map(async ({ package: name, version }) => {
          const p = await pkg.find(name);

          if (p == null) {
            throw new Error("Resolved to a non-existent package");
          }

          const pv = (await p.versions()).filter(v => v.version === version)[0];

          if (pv == null) {
            throw new Error("Resolved to a non-existent package version");
          }

          return pv;
        })
      );
    }
  },

  Mutation: {
    async publishPackage(
      _: any,
      {
        name,
        version,
        package: upload,
        checksum
      }: {
        name: string;
        version: string;
        package: Promise<FileUpload>;
        checksum: string;
      },
      { pkg, user }: Context
    ): Promise<Package | null> {
      if (!user.isLoggedIn()) {
        throw new AuthenticationError(
          "Only logged in users can publish packages."
        );
      }

      return pkg.publish(
        name,
        version,
        (await upload).createReadStream(),
        user,
        checksum
      );
    }
  }
};
