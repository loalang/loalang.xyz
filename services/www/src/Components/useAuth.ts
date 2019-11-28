import { useMutation, useQuery, useApolloClient } from "react-apollo";
import gql from "graphql-tag";
import { useEffect } from "react";

const USER_FRAGMENT = gql`
  fragment AuthUser on User {
    id
    email
  }
`;

const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      ...AuthUser
    }
  }

  ${USER_FRAGMENT}
`;

const REGISTER_MUTATION = gql`
  mutation Register($email: String!, $password: String!) {
    register(email: $email, password: $password) {
      ...AuthUser
    }
  }

  ${USER_FRAGMENT}
`;

const ME_QUERY = gql`
  query UserQuery {
    me {
      ...AuthUser
    }
  }

  ${USER_FRAGMENT}
`;

export interface User {
  id: string;
  email: string;
}

export function useUser(): { isLoading: boolean; user: User | null } {
  const { loading, data } = useQuery(ME_QUERY);

  return {
    isLoading: loading,
    user: data == null ? null : data.me
  };
}

export function useLogin(): [
  (email: string, password: string) => void,
  { isLoading: boolean; failed: boolean }
] {
  const query = LOGIN_MUTATION;
  const pick = (data: any) => data.login;

  return useLoginOrRegister(query, pick);
}

export function useRegister(): [
  (email: string, password: string) => void,
  { isLoading: boolean; failed: boolean }
] {
  const query = REGISTER_MUTATION;
  const pick = (data: any) => data.register;

  return useLoginOrRegister(query, pick);
}

function useLoginOrRegister(query: any, pick: (data: any) => any): any {
  const [mutate, { loading, data, called }] = useMutation(query);
  const client = useApolloClient();

  useEffect(() => {
    if (data != null && pick(data) != null) {
      client.cache.writeQuery({
        query: ME_QUERY,
        data: {
          me: pick(data)
        }
      });
      client.reFetchObservableQueries();
    }
  }, [data, client, pick]);

  const f = (email: string, password: string) => {
    mutate({ variables: { email, password } });
  };

  return [
    f,
    {
      isLoading: loading,
      failed: !loading && called && (data == null || pick(data) == null)
    }
  ];
}
