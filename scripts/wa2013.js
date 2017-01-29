/* eslint
 import/no-extraneous-dependencies: ["error", { "devDependencies": true }]
 no-console: 0
*/

import { each, parallel } from 'async';
import { omit, partition, uniq } from 'lodash/fp';
import mongoose from 'mongoose';
import parseData from './parseData';
import ResultSchema from '../schema/ResultSchema';

mongoose.connect('mongodb://localhost/elections');

const db = mongoose.connection;

db.on('error', (err) => {
  console.log(err);
  process.exit();
});

db.once('open', () => {
  const keyMap = {
    candidate_name: 'name',
    district_name: 'electorateName',
    party_code: 'party',
    votes: 'votes',
  };

  parallel({
    primaryData: cb => parseData('wa2013_primary.csv', keyMap, cb),
    runoffData: cb => parseData('wa2013_2cp.csv', keyMap, cb),
  }, (error, { primaryData, runoffData }) => {
    if (error) {
      console.log(error);
      process.exit();
    }

    const Result = mongoose.model('Result', ResultSchema);
    Result.collection.drop();

    const electorates = uniq(
      primaryData.map(x => x.electorateName),
    );

    each(electorates, (electorateName, cb) => {
      const electorateId = electorateName.toUpperCase().replace(/\s+/g, '_');
      const [[spoilt], primary] = partition(x => x.party === 'INF')(
        primaryData
          .filter(x => x.electorateName === electorateName)
          .map(x => omit('electorateName')(x)),
      );
      const runoff = runoffData
        .filter(x => x.electorateName === electorateName)
        .map(x => omit('electorateName')(x));

      const document = new Result({
        electionType: 'general',
        locale: 'WA',
        chamber: 'LA',
        parliament: 39,
        date: new Date('2013-03-09'),
        vacancies: 1,
        informal: spoilt.votes,
        electorateId,
        electorateName,
        primary,
        runoff,
      });

      document.save((err) => {
        if (err) {
          console.error(err);
        } else {
          console.log('Saved', electorateName);
        }
        cb();
      });
    }, () => {
      mongoose.disconnect();
      process.exit();
    });
  });
});
