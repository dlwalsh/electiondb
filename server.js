import express from 'express';
import graphqlHTTP from 'express-graphql';
import graphqlSchema from './graphql-schema';

const app = express();

app.use('/graphql', graphqlHTTP({
  schema: graphqlSchema,
  graphql: true,
}));

app.listen(3000);
