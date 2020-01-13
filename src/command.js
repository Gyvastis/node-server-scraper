const util = require('util');
const domainSearch = require('./search');

domainSearch(
  process.argv[2]
).then(data => console.log(data));
// ).then(data => console.log(util.inspect(data, false, null, true)));
