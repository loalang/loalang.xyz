import path from "path";
import { fileLoader, mergeResolvers, mergeTypes } from "merge-graphql-schemas";
import { ApolloServer } from "apollo-server";
import { makeExecutableSchema } from "graphql-tools";
import Search from "./Search/Search";

const typesArray = fileLoader(
  path.join(__dirname, "Resolvers", "**", "*.graphql")
);
const resolversArray = fileLoader(
  path.join(__dirname, "Resolvers", "**", "*.resolver.*"),
  {
    extensions: [".js", ".ts"]
  }
);
// .map(constructor => {
//   const resolver: any = {};
//   for (const property in constructor.prototype) {
//     const field = constructor.prototype[property];

//     if (typeof field === "function") {
//       resolver[property] = (instance: any, ...args: any[]) =>
//         field.call(instance, ...args);
//     } else {
//       resolver[property] = field;
//     }
//   }
//   return { [constructor.name]: resolver };
// });

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
  context: {
    search: Search.create()
  }
});
