/* eslint no-console: 0 */

import express from 'express';
import graphQLHTTP from 'express-graphql';
import schema from './schema';

const { PORT = 3000 } = process.env;
const app = express();

app.use('/graphql', graphQLHTTP({ schema }));

const server = app.listen(PORT, () => {
  const { address, port } = server.address();

  console.log('GraphQL listening at http://%s:%s', address, port);
});
