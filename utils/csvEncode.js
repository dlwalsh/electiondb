/* eslint import/no-extraneous-dependencies: ["error", { "devDependencies": true }] */

import { stringify } from 'csv';

function csvEncode(data) {
  return new Promise((resolve, reject) => stringify(data, {
    columns: {
      district: 'District',
      name: 'Candidate',
      party: 'Party',
      votes: 'Votes',
    },
    header: true,
  }, (err, output) => {
    if (err) {
      reject(err);
    } else {
      resolve(output);
    }
  }));
}

export default csvEncode;
