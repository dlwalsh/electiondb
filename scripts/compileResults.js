/* eslint
 import/no-extraneous-dependencies: ["error", { "devDependencies": true }]
 no-console: 0
*/

import { parallel } from 'async';
import { omit, partition, uniq } from 'lodash/fp';
import { readFileSync } from 'fs';
import parseData from './parseData';
import saveRemote from './saveRemote';

let config;

try {
  config = JSON.parse(readFileSync(process.argv[2]));
} catch (err) {
  console.error(err);
  process.exit(1);
}

const {
  commonInfo,
  keyMap,
  primaryDataFile,
  runoffDataFile,
} = config;

parallel({
  primaryData: cb => parseData(primaryDataFile, keyMap, cb),
  runoffData: cb => parseData(runoffDataFile, keyMap, cb),
}, (error, { primaryData, runoffData }) => {
  if (error) {
    console.error(error);
    process.exit(1);
  }

  const entries = uniq(
    primaryData.map(x => x.electorateName),
  ).map((electorateName) => {
    const electorateId = electorateName.toLowerCase().replace(/\s+/g, '_');
    const [[spoilt], primary] = partition(x => x.party === 'INF')(
      primaryData
        .filter(x => x.electorateName === electorateName)
        .map(omit('electorateName')),
    );
    const runoff = runoffData
      .filter(x => x.electorateName === electorateName)
      .map(omit('electorateName'));

    return {
      electionType: commonInfo.electionType,
      realm: commonInfo.realm,
      chamber: commonInfo.chamber,
      parliament: commonInfo.parliament,
      date: commonInfo.date,
      vacancies: commonInfo.vacancies,
      informal: spoilt.votes,
      electorateId,
      electorateName,
      primary,
      runoff,
    };
  });

  saveRemote(entries, (err) => {
    if (err) {
      console.error(err);
    } else {
      console.log('Entries saved to database');
    }
  });
});
