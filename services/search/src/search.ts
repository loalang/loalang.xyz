export default interface Search {
  search(
    term: string | null,
    limit: number,
    offset: number
  ): Promise<SearchResults>;
}

export interface SearchResults {
  count: number;
  results: SearchResult[];
}

export type SearchResult = PackageSearchResult | ClassDocSearchResult;

export interface PackageSearchResult {
  __type: "PACKAGE";
  name: string;
}

export interface ClassDocSearchResult {
  __type: "CLASS_DOC";
  simpleName: string;
  qualifiedName: string;
}
