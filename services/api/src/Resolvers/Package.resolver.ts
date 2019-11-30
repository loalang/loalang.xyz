import Package from "./Package";
import { FileUpload } from "graphql-upload";
import Context from "../Context";
import { AuthenticationError } from "apollo-server";

export default {
  Query: {
    async package(
      _: any,
      { name }: { name: string },
      { pkg }: Context
    ): Promise<Package | null> {
      return pkg.find(name);
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
