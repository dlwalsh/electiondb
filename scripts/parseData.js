/* eslint import/no-extraneous-dependencies: ["error", { "devDependencies": true }] */

import { waterfall } from 'async';
import { parse } from 'csv';
import { readFile } from 'fs';
import { resolve } from 'path';
import format from 'string-format';

function parseData(filename, keyMap, callback) {
  const filepath = resolve(__dirname, '..', filename);

  waterfall([
    cb => readFile(filepath, cb),
    (content, cb) => parse(content, { columns: true }, cb),
  ], (error, data) => {
    if (error) {
      callback(error);
      return;
    }

    const entries = data.map(item => (
      Object.entries(keyMap).reduce((memo, [key, template]) => Object.assign(memo, {
        [key]: format(template, item),
      }), {})
    ));

    callback(null, entries);
  });
}

export default parseData;
