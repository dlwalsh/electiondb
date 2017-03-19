/* eslint
  import/no-extraneous-dependencies: ["error", { "devDependencies": true }]
  arrow-body-style: 0,
  newline-per-chained-call: 0,
  no-console: 0
*/

import { load } from 'cheerio';
import { writeFile } from 'fs';
import { resolve as pathResolve } from 'path';
import requestPromise from 'request-promise';
import csvEncode from '../utils/csvEncode';

const prefix = 'http://www.ntec.nt.gov.au';

requestPromise(`${prefix}/2016 Territory Election/results/pages/default.aspx`).then((html) => {
  const $ = load(html);

  const links = $('h2 > a').toArray().map((elem) => {
    const href = $(elem).prop('href');
    return `${prefix}/${href}`;
  });

  return Promise.all(links.map(requestPromise));
}).then((pages) => {
  return pages.reduce((memo, html) => {
    const $ = load(html);
    const district = $('.c-page-title').text().trim();

    console.log(`Processing ${district}...`);

    const rows = $('h3:contains("Electorate summary") + table tr').toArray();

    return rows.slice(1).reduce(({ primary, runoff }, row) => {
      const cells = $(row).find('td');
      const name = cells.eq(0).text().trim();

      if (!cells.eq(0).is('[colspan=2]')) {
        const party = cells.eq(1).text().trim();
        const primaryVotes = cells.eq(2).text().trim();
        const runoffVotes = cells.eq(3).text().trim();

        return {
          primary: [...primary, {
            district,
            name,
            party,
            votes: primaryVotes,
          }],
          runoff: runoffVotes ? [...runoff, {
            district,
            name,
            party,
            votes: runoffVotes,
          }] : runoff,
        };
      } else if (name === 'Exhausted') {
        return {
          primary,
          runoff: [...runoff, {
            district,
            name: 'Exhaused',
            party: 'EXH',
            votes: cells.eq(2).text(),
          }],
        };
      } else if (name === 'Informal') {
        return {
          primary: [...primary, {
            district,
            name: 'Informal',
            party: 'INF',
            votes: cells.eq(1).text(),
          }],
          runoff,
        };
      } else if (name === 'Enrolment') {
        return {
          primary: [...primary, {
            district,
            name: 'Enrolment',
            party: 'ENR',
            votes: cells.eq(1).text(),
          }],
          runoff,
        };
      }

      return { primary, runoff };
    }, memo);
  }, { primary: [], runoff: [] });
}).then(({ primary, runoff }) => {
  return Promise.all([
    csvEncode(primary),
    csvEncode(runoff),
  ]);
}).then(([primaryContent, runoffContent]) => {
  const primaryFileName = pathResolve(__dirname, '../data/nt2016_primary.csv');
  const runoffFileName = pathResolve(__dirname, '../data/nt2016_2cp.csv');
  writeFile(primaryFileName, primaryContent, (err) => {
    if (err) {
      throw err;
    }
    console.log(`Written to ${primaryFileName}`);
  });
  writeFile(runoffFileName, runoffContent, (err) => {
    if (err) {
      throw err;
    }
    console.log(`Written to ${runoffFileName}`);
  });
}).catch((error) => {
  console.log(error);
});
