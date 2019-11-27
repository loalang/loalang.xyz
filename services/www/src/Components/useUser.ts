import gql from "graphql-tag";
import { useQuery } from "react-apollo";

export const ME_QUERY = gql`
  query UserQuery {
    me {
      id
      email
    }
  }
`;

export interface User {
  id: string;
  email: string;
}

export default function useUser(): { isLoading: boolean; user: User | null } {
  const { loading, data } = useQuery(ME_QUERY);

  return {
    isLoading: loading,
    user: data == null ? null : data.me
  };
}
