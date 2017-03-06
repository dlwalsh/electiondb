/* eslint import/no-extraneous-dependencies: ["error", { "devDependencies": true }] */

import { waterfall } from 'async';
import { parse } from 'csv';
import { readFile } from 'fs';
import { resolve } from 'path';
import format from 'string-format';

function parseData(filename, { keyMap, truthyValue }, callback) {
  const filepath = resolve(__dirname, '..', filename);

  waterfall([
    cb => readFile(filepath, cb),
    (content, cb) => parse(content, { columns: true }, cb),
  ], (error, data) => {
    if (error) {
      callback(error);
      return;
    }

    const entries = data.map(item => ({
      name: keyMap.name ? format(keyMap.name, item) : undefined,
      electorateName: keyMap.electorateName ? format(keyMap.electorateName, item) : undefined,
      party: keyMap.party ? format(keyMap.party, item) : undefined,
      votes: keyMap.votes ? format(keyMap.votes, item) : undefined,
      elected: keyMap.elected && format(keyMap.elected, item) === truthyValue,
      incumbent: keyMap.incumbent && format(keyMap.incumbent, item) === truthyValue,
    }));

    callback(null, entries);
  });
}

export default parseData;
