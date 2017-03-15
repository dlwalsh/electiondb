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
  exhaustedCode,
  informalCode,
  keyMap,
  primaryDataFile,
  runoffDataFile,
  truthyValue,
} = config;

parallel({
  primaryData: cb => parseData(primaryDataFile, { keyMap, truthyValue }, cb),
  runoffData: cb => parseData(runoffDataFile, { keyMap, truthyValue }, cb),
}, (error, { primaryData, runoffData }) => {
  if (error) {
    console.error(error);
    process.exit(1);
  }

  const entries = uniq(
    primaryData.map(x => x.electorateName),
  ).map((electorateName) => {
    const electorateId = electorateName.toLowerCase().replace(/\s+/g, '-');
    const ballotsCast = primaryData
      .filter(x => x.electorateName === electorateName)
      .map(omit('electorateName'));
    const ballotsDistributed = runoffData
      .filter(x => x.electorateName === electorateName)
      .map(omit('electorateName'));
    const [[spoilt], primary] = partition(x => x.party === informalCode)(ballotsCast);
    const [, runoff] = partition(x => x.party === exhaustedCode)(ballotsDistributed);

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

  saveRemote(entries, {
    electionType: commonInfo.electionType,
    realm: commonInfo.realm,
    chamber: commonInfo.chamber,
    parliament: commonInfo.parliament,
  }).then(() => {
    console.log('Entries saved to database');
    process.exit();
  }, (err) => {
    console.error(err);
    process.exit(1);
  });
});
