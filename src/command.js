const util = require('util');
const domainSearch = require('./search');

domainSearch(
  process.argv[2],
  process.argv[3]
).then(data => console.log(util.inspect(data, false, null, true)));
