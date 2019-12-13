import Context from "../../Context";

export default {
  Query: {
    async rootNamespaces(_: any, {}: {}, {}: Context) {
      return [
        {
          name: "Loa",
          subNamespaces: [],
          classes: []
        }
      ];
    }
  }
};
