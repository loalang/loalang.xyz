import Search from "../Search/Search";
import SearchPackage from "../Search/SearchPackage";
import Package from "./Package";
import SearchClassDoc from "../Search/SearchClassDoc";
import ClassDoc from "./Documentation/ClassDoc";

export default {
  Query: {
    async search(
      _: any,
      { term, limit, offset }: { term: string; limit: number; offset: number },
      { search }: { search: Search }
    ): Promise<{ count: number; results: object[] }> {
      const response = await search.search(term, limit, offset);

      return {
        count: response.count,
        results: response.results.map(s => {
          switch (s.__type) {
            case "PACKAGE":
              return new SearchPackage(s);
            case "CLASS_DOC":
              return new SearchClassDoc(s);
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
