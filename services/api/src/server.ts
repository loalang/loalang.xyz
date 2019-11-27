import path from "path";
import { fileLoader, mergeResolvers, mergeTypes } from "merge-graphql-schemas";
import { ApolloServer } from "apollo-server";
import { makeExecutableSchema } from "graphql-tools";
import { createContext } from "./Context";

const typesArray = fileLoader(
  path.join(__dirname, "Resolvers", "**", "*.graphql")
);
const resolversArray = fileLoader(
  path.join(__dirname, "Resolvers", "**", "*.resolver.*"),
  {
    extensions: [".js", ".ts"]
  }
);

const typeDefs = mergeTypes(typesArray);
const resolvers = mergeResolvers(resolversArray);
const schema = makeExecutableSchema({
  typeDefs,
  resolvers
});

export default new ApolloServer({
  schema,
  playground: true,
  introspection: true,
  context: ({ req, res }) => createContext(req, res)
});
