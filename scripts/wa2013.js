/* eslint
 import/no-extraneous-dependencies: ["error", { "devDependencies": true }]
 no-console: 0
*/

import { parallel } from 'async';
import { omit, partition, uniq } from 'lodash/fp';
import parseData from './parseData';
import saveData from './saveData';

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

  const entries = uniq(
    primaryData.map(x => x.electorateName),
  ).map((electorateName) => {
    const electorateId = electorateName.toUpperCase().replace(/\s+/g, '_');
    const [[spoilt], primary] = partition(x => x.party === 'INF')(
      primaryData
        .filter(x => x.electorateName === electorateName)
        .map(omit('electorateName')),
    );
    const runoff = runoffData
      .filter(x => x.electorateName === electorateName)
      .map(omit('electorateName'));

    return {
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
    };
  });

  saveData(entries, (err) => {
    if (err) {
      console.error(err);
    }
    process.exit();
  });
});
