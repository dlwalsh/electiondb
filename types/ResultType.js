import {
  GraphQLInt,
  GraphQLList,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';
import CandidateType from './CandidateType';

const ResultType = new GraphQLObjectType({
  name: 'contest',
  fields: {
    electorateId: {
      type: GraphQLString,
    },
    electorateName: {
      type: GraphQLString,
    },
    type: {
      type: GraphQLString,
    },
    locale: {
      type: GraphQLString,
    },
    zone: {
      type: GraphQLString,
    },
    chamber: {
      type: GraphQLString,
    },
    parliament: {
      type: GraphQLInt,
    },
    date: {
      type: GraphQLString,
    },
    vacancies: {
      type: GraphQLInt,
    },
    enrolment: {
      type: GraphQLInt,
    },
    informal: {
      type: GraphQLInt,
    },
    primary: {
      type: new GraphQLList(CandidateType),
    },
    runoff: {
      type: new GraphQLList(CandidateType),
    },
  },
});

export default ResultType;
