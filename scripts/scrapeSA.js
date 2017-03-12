/* eslint
  import/no-extraneous-dependencies: ["error", { "devDependencies": true }]
  arrow-body-style: 0,
  newline-per-chained-call: 0,
  no-console: 0
*/

import { load } from 'cheerio';
import { stringify as csvStringify } from 'csv';
import { writeFile } from 'fs';
import { resolve as pathResolve } from 'path';
import requestPromise from 'request-promise';

const year = process.argv[2] || '2014';
const prefix = 'http://www.ecsa.sa.gov.au';
const landingUrl = `${prefix}/elections/state-elections/past-state-election-results`;

function getCellText(index) {
  const cell = this.find('td').eq(index);
  cell.find('br').replaceWith(', ');
  return cell.text().trim();
}

function getNumber(text) {
  const numberStr = text.replace(/,/g, '');
  return parseInt(numberStr, 10);
}

function csvEncode(data) {
  return new Promise((resolve, reject) => csvStringify(data, {
    columns: {
      district: 'District',
      name: 'Candidate',
      party: 'Party',
      votes: 'Votes',
      formal: 'Formal votes',
      informal: 'Informal votes',
      total: 'Total votes',
      enrolment: 'Enrolment',
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

requestPromise(landingUrl).then((html) => {
  const $ = load(html);
  const links = $(`a[name=${year}] ~ * > table`).first().find('a:contains("District Results")');
  const urls = links.map((i, elem) => $(elem).prop('href'));

  const pageRequests = urls.toArray().map(url => requestPromise(`${prefix}${url}`));

  return Promise.all(pageRequests);
}).then((pages) => {
  return pages.reduce((memo, html) => {
    const $ = load(html);

    $.prototype.getCellText = getCellText;

    const district = $('h1 > strong').text();
    const tables = $('table');

    const summaryRows = tables.eq(0).find('tbody > tr.summary');
    const formal = getNumber(summaryRows.eq(0).getCellText(2));
    const informal = getNumber(summaryRows.eq(1).getCellText(2));
    const total = getNumber(summaryRows.eq(2).getCellText(2));
    const enrolment = getNumber(
      $('.electors-enrolled-text').text().replace(/^Electors Enrolled /, ''),
    );

    const [primary, runoff] = tables.toArray().map(table => (
      $(table).find('tbody > tr:not(.summary)').map((j, row) => {
        const votes = getNumber($(row).getCellText(4));

        return {
          name: $(row).getCellText(0),
          party: $(row).getCellText(1),
          votes,
          district,
          formal,
          informal,
          total,
          enrolment,
        };
      }).toArray()
    ));

    return {
      primary: [...memo.primary, ...primary],
      runoff: [...memo.runoff, ...runoff],
    };
  }, {
    primary: [],
    runoff: [],
  });
}).then(({ primary, runoff }) => {
  return Promise.all([
    csvEncode(primary),
    csvEncode(runoff),
  ]);
}).then(([primary, runoff]) => {
  const primaryFilename = pathResolve(__dirname, '../data', `sa${year}_primary.csv`);
  const runoffFilename = pathResolve(__dirname, '../data', `sa${year}_2cp.csv`);

  writeFile(primaryFilename, primary, (err) => {
    if (err) {
      throw err;
    }
    console.log(`Saved ${primaryFilename}`);
  });

  writeFile(runoffFilename, runoff, (err) => {
    if (err) {
      throw err;
    }
    console.log(`Saved ${runoffFilename}`);
  });
}).catch((error) => {
  console.error(error);
});
