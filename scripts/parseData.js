/* eslint import/no-extraneous-dependencies: ["error", { "devDependencies": true }] */

import { waterfall } from 'async';
import { parse } from 'csv';
import { readFile } from 'fs';
import { resolve } from 'path';

function parseData(filename, keyMap, callback) {
  const filepath = resolve(__dirname, '../data', filename);

  waterfall([
    cb => readFile(filepath, cb),
    (content, cb) => parse(content, { columns: true }, cb),
  ], (error, data) => {
    if (error) {
      callback(error);
      return;
    }

    const entries = data.map(item => (
      Object.entries(item).reduce((memo, [property, value]) => {
        const key = keyMap[property];

        return key ? Object.assign(memo, {
          [key]: value,
        }) : memo;
      }, {})
    ));

    callback(null, entries);
  });
}

export default parseData;
