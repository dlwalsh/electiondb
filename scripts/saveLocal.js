/* eslint
 import/no-extraneous-dependencies: ["error", { "devDependencies": true }]
 no-console: 0
*/

import mongoose from 'mongoose';
import ResultSchema from '../schema/ResultSchema';

function saveData(data, callback) {
  mongoose.connect('mongodb://localhost/elections');
  const db = mongoose.connection;

  db.on('error', callback);

  db.once('open', () => {
    const Result = mongoose.model('Result', ResultSchema);
    Result.collection.drop();

    Result.insertMany(data, (err) => {
      callback(err);
      mongoose.disconnect();
    });
  });
}

export default saveData;
