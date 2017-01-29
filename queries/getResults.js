import mongoose from 'mongoose';
import { pick } from 'lodash/fp';
import ResultSchema from '../schema/ResultSchema';

const Result = mongoose.model('Result', ResultSchema);

function getResults(options = {}) {
  const query = pick([
    'chamber',
    'electionType',
    'electorateId',
    'locale',
    'parliament',
  ])(options);

  return new Promise((resolve, reject) => {
    mongoose.connect('mongodb://localhost/elections');
    const db = mongoose.connection;

    db.on('error', reject);

    db.on('open', () => {
      Result.find(query, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
        mongoose.disconnect();
      });
    });
  });
}

export default getResults;
