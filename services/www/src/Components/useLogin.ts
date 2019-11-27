import { useMutation, useApolloClient } from "react-apollo";
import gql from "graphql-tag";
import { useEffect } from "react";
import { ME_QUERY } from "./useUser";

const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      id
      email
    }
  }
`;

export default function useLogin(): [
  (email: string, password: string) => void,
  { isLoading: boolean; failed: boolean }
] {
  const [login, { loading, data, called }] = useMutation(LOGIN_MUTATION);

  const f = (email: string, password: string) => {
    login({ variables: { email, password } });
  };

  const client = useApolloClient();

  useEffect(() => {
    if (data != null && data.login != null) {
      client.cache.writeQuery({
        query: ME_QUERY,
        data: {
          me: data.login
        }
      });
      client.reFetchObservableQueries();
    }
  }, [data]);

  return [
    f,
    {
      isLoading: loading,
      failed: !loading && called && (data == null || data.login == null)
    }
  ];
}
