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

const year = '2010';
const prefix = 'http://www.ecsa.sa.gov.au';
const landingUrl = `${prefix}/elections/state-elections/past-state-election-results`;

function getCellText(index) {
  const cell = this.find('td, th').eq(index);
  cell.find('br').replaceWith(', ');
  return cell.text().trim();
}

function getNumber(text) {
  const numberStr = text.replace(/,/g, '');
  return parseInt(numberStr, 10);
}

function getPortAdelaideHack() {
  const meta = {
    district: 'Port Adelaide',
  };
  const primary = [{
    name: 'LAWRIE, Sue',
    party: 'LIB',
    votes: 5831,
  }, {
    name: 'HAMBOUR, Bruce',
    party: 'FFP',
    votes: 1281,
  }, {
    name: 'JAMES, Max',
    party: 'IND',
    votes: 2398,
  }, {
    name: 'FOLEY, Kevin',
    party: 'ALP',
    votes: 10854,
  }, {
    name: 'BOLAND, Marie',
    party: 'GRN',
    votes: 1368,
  }, {
    name: 'Informal votes',
    party: 'INF',
    votes: 21732,
  }];
  const runoff = [{
    name: 'LAWRIE, Sue',
    party: 'LIB',
    votes: 8089,
  }, {
    name: 'FOLEY, Kevin',
    party: 'ALP',
    votes: 13643,
  }];

  return {
    primary: primary.map(candidate => Object.assign({}, meta, candidate)),
    runoff: runoff.map(candidate => Object.assign({}, meta, candidate)),
  };
}

function csvEncode(data) {
  return new Promise((resolve, reject) => csvStringify(data, {
    columns: {
      district: 'District',
      name: 'Candidate',
      party: 'Party',
      votes: 'Votes',
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

    const district = $('h2').text().replace(/^District of (.+) - .+$/, '$1');
    const tables = $('.percenttable');

    if (district === 'Port Adelaide') {
      const { primary, runoff } = getPortAdelaideHack();
      return {
        primary: [...memo.primary, ...primary],
        runoff: [...memo.runoff, ...runoff],
      };
    }
    if (tables.length < 2) {
      console.error(`There's a problem with ${district}`);
      return memo;
    }

    const primaryRows = tables.eq(0).find('tr');
    const runoffRows = tables.eq(1).find('tr');

    const formal = getNumber(
      primaryRows.filter(':contains("Total Formal")').getCellText(2),
    );
    const informal = getNumber(
      primaryRows.filter(':contains("Informal")').getCellText(2),
    );
    const total = getNumber(
      $('table').eq(1).find('tr').first().getCellText(2),
    );
    const enrolment = getNumber(
      $('.datahighlight:contains("Electors Enrolled") > span').text(),
    );

    const [primary, runoff] = [
      primaryRows.slice(2, -3),
      runoffRows.slice(2),
    ].map(rows => (
      $(rows).map((j, row) => ({
        name: $(row).getCellText(0),
        party: $(row).getCellText(1),
        votes: getNumber($(row).getCellText(2)),
        district,
      })).toArray()
    ));

    return {
      primary: [...memo.primary, ...primary, {
        name: 'Informal votes',
        party: 'INF',
        votes: informal,
        district,
      }],
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
