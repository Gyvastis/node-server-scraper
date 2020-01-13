const util = require('util');
const fs = require('fs');
const domainSearch = require('./search');

domainSearch(
  process.argv[2]
).then(data => {
  try {
    fs.writeFileSync('./output/output.json', JSON.stringify(data, null, 4));
  } catch(err) {
    // An error occurred
    console.error(err);
  }
  console.log(data)
});
// ).then(data => console.log(util.inspect(data, false, null, true)));
