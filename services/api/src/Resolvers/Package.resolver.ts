import Package from "./Package";
import { FileUpload } from "graphql-upload";
import Context from "../Context";

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
        package: upload
      }: { name: string; version: string; package: Promise<FileUpload> },
      { pkg }: Context
    ): Promise<Package | null> {
      return pkg.publish(name, version, (await upload).createReadStream());
    }
  }
};
