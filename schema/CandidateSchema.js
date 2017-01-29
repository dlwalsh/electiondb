import { Schema } from 'mongoose';

const CandidateSchema = new Schema({
  name: String,
  party: String,
  votes: Number,
});

export default CandidateSchema;
