import {
  GraphQLList,
  GraphQLInt,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
} from 'graphql';
import ResultType from './ResultType';
import query from '../query';

const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'RootQueryType',
    arguments: {
      locale: GraphQLString,
    },
    fields: {
      results: {
        type: new GraphQLList(ResultType),
        args: {
          chamber: {
            type: GraphQLString,
          },
          electionType: {
            type: GraphQLString,
          },
          electorateId: {
            type: GraphQLString,
          },
          parliament: {
            type: GraphQLInt,
          },
          realm: {
            type: GraphQLString,
          },
        },
        resolve(root, args) {
          return query('elections', args);
        },
      },
    },
  }),
});

export default schema;
