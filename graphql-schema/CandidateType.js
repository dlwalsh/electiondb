import {
  GraphQLBoolean,
  GraphQLInt,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';

const CandidateType = new GraphQLObjectType({
  name: 'candidate',
  fields: {
    name: {
      type: GraphQLString,
    },
    party: {
      type: GraphQLString,
    },
    votes: {
      type: GraphQLInt,
    },
    incumbent: {
      type: GraphQLBoolean,
    },
    elected: {
      type: GraphQLBoolean,
    },
  },
});

export default CandidateType;
