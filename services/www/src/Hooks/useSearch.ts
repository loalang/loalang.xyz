import { useQuery } from "react-apollo";
import gql from "graphql-tag";

const SEARCH_PACKAGES_QUERY = gql`
  query SearchPackages($term: String!) {
    search(term: $term, limit: 10, offset: 0) {
      count
      results {
        __typename
        ... on Package {
          name
        }
        ... on ClassDoc {
          simpleName
          qualifiedName
        }
      }
    }
  }
`;

export type SearchResult =
  | {
      __typename: "Package";
      name: string;
    }
  | {
      __typename: "ClassDoc";
      simpleName: string;
      qualifiedName: string;
    };

export default function useSearch(
  term: string
): { results: SearchResult[]; count: number } {
  const { data } = useQuery(SEARCH_PACKAGES_QUERY, {
    variables: {
      term
    }
  });

  if (data == null) {
    return {
      count: 0,
      results: []
    };
  }

  return data.search;
}
