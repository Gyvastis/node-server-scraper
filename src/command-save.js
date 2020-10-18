const util = require('util');
const fs = require('fs');
const scrape = require('./scrape');

scrape(process.argv[2])
  .then(data => {
    fs.writeFileSync('./output/output.json', JSON.stringify(data, null, 4));
  });
