import {
  GraphQLList,
  GraphQLInt,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
} from 'graphql';
import ResultType from './ResultType';
import getResults from '../queries/getResults';

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
          locale: {
            type: GraphQLString,
          },
          parliament: {
            type: GraphQLInt,
          },
        },
        resolve(root, args) {
          return getResults(args);
        },
      },
    },
  }),
});

export default schema;
