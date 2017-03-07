import {
  GraphQLList,
  GraphQLInt,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
} from 'graphql';
import mongoose from 'mongoose';
import ResultType from './ResultType';
import ResultSchema from '../db/ResultSchema';

mongoose.Promise = Promise;
const Result = mongoose.model('Result', ResultSchema);

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
          Result.find(args);
        },
      },
    },
  }),
});

export default schema;
