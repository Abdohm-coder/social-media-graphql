const { ApolloServer } = require("apollo-server");
const mongoose = require("mongoose");
const { MONGO_DB } = require("./config");
3;

const server = new ApolloServer({ typeDefs, resolvers });

mongoose
  .connect(MONGO_DB)
  .then(() => {
    console.log("MONGO DB CONNECTED");
    return server.listen({ port: 5000 });
  })
  .then(({ url }) => {
    console.log(`YOUR API IS RUNNING IN ${url}`);
  });
