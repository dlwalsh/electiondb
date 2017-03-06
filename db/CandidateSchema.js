import { Schema } from 'mongoose';

const CandidateSchema = new Schema({
  name: String,
  elected: Boolean,
  incumbent: Boolean,
  party: String,
  votes: Number,
});

export default CandidateSchema;
