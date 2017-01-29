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
    elected: {
      type: GraphQLBoolean,
    },
  },
});

export default CandidateType;
