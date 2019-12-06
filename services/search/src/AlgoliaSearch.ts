import Search, { SearchResults, SearchResult } from "./Search";
import algolia, { Client, Index } from "algoliasearch";

type AlgoliaResult = SearchResult & {
  objectID: string;
  _highlightResult: any;
};

export default class AlgoliaSearch implements Search {
  private constructor(
    private readonly _client: Client,
    private readonly _index: Index
  ) {}

  static create() {
    const client = algolia(
      process.env.ALGOLIA_APPLICATION_ID || "",
      process.env.ALGOLIA_ADMIN_KEY || ""
    );
    return new AlgoliaSearch(
      client,
      client.initIndex(process.env.ALGOLIA_INDEX || "")
    );
  }

  async index(...objects: SearchResult[]): Promise<void> {
    await this._index.addObjects(objects);
  }

  async search(
    term: string | null,
    limit: number,
    offset: number
  ): Promise<SearchResults> {
    if (!term) {
      return {
        count: 0,
        results: []
      };
    }

    const {
      results: [response]
    } = await this._client.search<AlgoliaResult>([
      {
        indexName: this._index.indexName,
        params: {
          hitsPerPage: limit,
          page: offset / limit
        },
        query: term
      }
    ]);

    return {
      count: response.nbHits,
      results: response.hits.map(result => {
        delete result._highlightResult;
        delete result.objectID;
        return result;
      })
    };
  }
}
