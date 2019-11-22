import ElasticSearch from "../ElasticSearch/ElasticSearch";
import ElasticPackage from "../ElasticSearch/ElasticPackage";
import Package from "./Package";
import ElasticClassDoc from "../ElasticSearch/ElasticClassDoc";
import ClassDoc from "./Documentation/ClassDoc";

export default {
  Query: {
    async search(
      _: any,
      { term, limit, offset }: { term: string; limit: number; offset: number },
      { elastic }: { elastic: ElasticSearch }
    ): Promise<{ count: number; results: object[] }> {
      const response = await elastic.search<
        | {
            __type: "PACKAGE";
            name: string;
          }
        | {
            __type: "CLASS_DOC";
            simpleName: string;
            qualifiedName: string;
          }
      >({
        q: term,
        index: "global-search"
      });

      return {
        count: response.total,
        results: response.hits.map(s => {
          switch (s.__type) {
            case "PACKAGE":
              return new ElasticPackage(s);
            case "CLASS_DOC":
              return new ElasticClassDoc(s);
          }
        })
      };
    }
  },

  SearchResult: {
    __resolveType(result: object) {
      switch (true) {
        case result instanceof Package:
          return "Package";
        case result instanceof ClassDoc:
          return "ClassDoc";
        default:
          throw new Error(
            `Cannot resolve SearchResult type of: ${JSON.stringify(result)}`
          );
      }
    }
  }
};
