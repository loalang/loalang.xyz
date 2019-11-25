import ElasticSearch from "./ElasticSearch/ElasticSearch";

export interface Response {
  count: number;
  results: Result[];
}

export type Result =
  | {
      __type: "PACKAGE";
      name: string;
    }
  | {
      __type: "CLASS_DOC";
      simpleName: string;
      qualifiedName: string;
    };

const es = ElasticSearch.create();

export default async function search(
  term: string | null,
  limit: number,
  offset: number
): Promise<Response> {
  const response = await es.search<Result>({
    q: term || undefined
  });
  return {
    count: response.total,
    results: response.hits.slice(offset, offset + limit)
  };
}
