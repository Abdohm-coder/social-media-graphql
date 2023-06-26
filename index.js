const { ApolloServer } = require("@apollo/server");
const { startStandaloneServer } = require("@apollo/server/standalone");
const { PubSub } = require("graphql-subscriptions");
const mongoose = require("mongoose");
const { MONGO_DB } = require("./config");
3;

const typeDefs = require("./graphql/typeDefs");
const resolvers = require("./graphql/resolvers");

const pubSub = new PubSub();

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

mongoose.connect(MONGO_DB).then(async () => {
  const { url } = await startStandaloneServer(server, {
    context: async ({ req }) => ({ req, pubSub }),
    listen: { port: 5000 },
  });
  console.log(`🚀  Server ready at ${url}`);
});
