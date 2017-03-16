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

const prefix = 'https://www.vec.vic.gov.au/Results/State2014/';

requestPromise(`${prefix}/Summary.html`).then((html) => {
  const $ = load(html);

  const links = $('.box-container').eq(3).find('a').toArray().map((elem) => {
    const href = $(elem).prop('href').trim();
    return `${prefix}${href}`;
  });

  return Promise.all(links.map(requestPromise));
}).then((pages) => {
  return pages.reduce((memo, html) => {
    const $ = load(html);
    const district = $('.breadcrumb-page').text().replace(/ District$/, '');
    const informal = $('th:contains("Informal Votes") + td').text().trim().replace(/ \(.*$/, '');

    const [primary, runoff] = [
      $('table[title="First preference votes"]'),
      $('table[title="Results after distribution of preferences"]'),
    ].map((table) => {
      return table.find('tbody > tr').toArray().slice(0, -1).map((row) => {
        const cells = $(row).find('td');

        return {
          name: cells.eq(0).text(),
          party: cells.eq(1).text().trim(),
          votes: cells.eq(2).text(),
          district,
        };
      });
    });

    return {
      primary: [...memo.primary, ...primary, {
        name: 'Informal votes',
        party: 'INF',
        votes: informal,
        district,
      }],
      runoff: [...memo.runoff, ...runoff],
    };
  }, { primary: [], runoff: [] });
}).then(({ primary, runoff }) => {
  return Promise.all([
    csvEncode(primary),
    csvEncode(runoff),
  ]);
}).then(([primaryContent, runoffContent]) => {
  const primaryFileName = pathResolve(__dirname, '../data/vic2014_primary.csv');
  const runoffFileName = pathResolve(__dirname, '../data/vic2014_2cp.csv');
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
  console.error(error);
});
