import { Schema } from 'mongoose';
import CandidateSchema from './CandidateSchema';

const ResultSchema = new Schema({
  electorateId: String,
  electorateName: String,
  electionType: String,
  locale: String,
  zone: String,
  chamber: String,
  parliament: Number,
  date: Date,
  vacancies: Number,
  enrolment: Number,
  informal: Number,
  primary: [CandidateSchema],
  runoff: [CandidateSchema],
});

export default ResultSchema;
