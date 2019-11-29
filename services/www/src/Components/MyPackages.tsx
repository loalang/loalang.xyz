import React from "react";
import { useQuery } from "react-apollo";
import gql from "graphql-tag";

export default function MyPackages() {
  const { isLoading, packages } = useMyPackages();

  if (isLoading) {
    return <>Loading...</>;
  }

  return (
    <ul>
      {packages.map(
        ({ id, name, versions, latestVersion: { version: latestVersion } }) => (
          <li key={id}>
            <h2>{name}</h2>

            <ul>
              {versions.map(({ version }) => (
                <li key={version}>
                  {version}

                  {version === latestVersion && <strong>Latest</strong>}
                </li>
              ))}
            </ul>
          </li>
        )
      )}
    </ul>
  );
}

const GET_MY_PACKAGES_QUERY = gql`
  query GetMyPackages {
    me {
      id
      packages {
        id
        name
        latestVersion {
          version
        }
        versions {
          version
          url
        }
      }
    }
  }
`;

export interface Package {
  id: string;
  name: string;
  latestVersion: {
    version: string;
  };
  versions: {
    version: string;
    url: string;
  }[];
}

function useMyPackages(): { isLoading: boolean; packages: Package[] } {
  const { loading, data } = useQuery(GET_MY_PACKAGES_QUERY);

  return {
    isLoading: loading,
    packages: data == null || data.me == null ? [] : data.me.packages
  };
}
