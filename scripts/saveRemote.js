/* eslint import/no-extraneous-dependencies: ["error", { "devDependencies": true }] */

import mongoose from 'mongoose';
import ResultSchema from '../mongoose-schema/ResultSchema';
import { MONGO_URI } from '../secrets';

mongoose.Promise = global.Promise;

function saveRemote(data, commonCriteria = {}) {
  const Result = mongoose.model('Result', ResultSchema);

  return mongoose.connect(MONGO_URI).then(() => (
    Result.remove(commonCriteria)
  )).then(() => (
    Result.insertMany(data)
  ));
}

export default saveRemote;
