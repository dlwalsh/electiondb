/* eslint import/no-extraneous-dependencies: ["error", { "devDependencies": true }] */

import mongoose from 'mongoose';
import ResultSchema from '../db/ResultSchema';
import { MONGO_URI } from '../secrets';

mongoose.Promise = Promise;

function saveRemote(data, commonFields = {}) {
  const Result = mongoose.model('Result', ResultSchema);

  return mongoose.connect(MONGO_URI).then(
    () => Result.remove(commonFields),
  ).then(
    () => Result.insertMany(data),
  );
}

export default saveRemote;
