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

export default async function search(
  term: string | null,
  limit: number,
  offset: number
): Promise<Response> {
  return {
    count: 0,
    results: []
  };
}
