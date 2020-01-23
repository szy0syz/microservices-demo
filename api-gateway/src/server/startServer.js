import { ApolloServer } from 'apollo-server-express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';

import typeDefs from '#root/graphql/typeDefs';
import resolvers from '#root/graphql/resolvers';
import accessEnv from '#root/helpers/accessEnv';
import formatGraphQLErrors from '#root/server/formatGraphQLErrors';

const PORT = accessEnv('PORT', 7000);

const apolloServer = new ApolloServer({
  context: c => c,
  formatError: formatGraphQLErrors,
  resolvers,
  typeDefs,
});

const app = express();

app.use(cookieParser());

app.use(
  cors({
    origin: (origin, cb) => cb(null, true),
    credentials: true,
  })
);

apolloServer.applyMiddleware({ app, cors: false });

app.listen(PORT, '0.0.0.0', () => {
  console.log(`API gateway listening on ${PORT}`);
});
