import React, { useState } from "react";
import { PageTitle } from "../Components/Header";
import { useQuery } from "react-apollo";
import gql from "graphql-tag";

export default function DocsView() {
  const [search, setSearch] = useState("");
  const { packages } = useSearchPackages(search);

  return (
    <>
      <PageTitle>Documentation</PageTitle>

      <input
        type="search"
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      <ul>
        {packages.map(pkg => (
          <li key={pkg.name}>{pkg.name}</li>
        ))}
      </ul>
    </>
  );
}

interface Package {
  name: string;
}

const SEARCH_PACKAGES_QUERY = gql`
  query SearchPackages($term: String!) {
    search(term: $term, limit: 10, offset: 0) {
      count
      results {
        __typename
        ... on Package {
          name
        }
      }
    }
  }
`;

function useSearchPackages(
  term: string
): { packages: Package[]; count: number } {
  const { data } = useQuery(SEARCH_PACKAGES_QUERY, {
    variables: {
      term
    }
  });

  if (data == null) {
    return {
      count: 0,
      packages: []
    };
  }

  return {
    count: data.search.count,
    packages: data.search.results.filter((r: any) => r.__typename === "Package")
  };
}
