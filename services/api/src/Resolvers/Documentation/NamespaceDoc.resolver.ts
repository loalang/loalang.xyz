import Context from "../../Context";
import NamespaceDoc from "./NamespaceDoc";

export default {
  Query: {
    async rootNamespaces(_: any, {}: {}, { docs }: Context) {
      const namespaces = await docs.rootNamespaces();
      return namespaces.map(name => new NamespaceDoc(name));
    }
  }
};
