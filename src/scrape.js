const fs = require('fs');
const Promise = require('bluebird');
const providerDir = __dirname + '/providers/';

const providerApis = {};
fs.readdirSync(providerDir).forEach(fileName => {
  providerApis[fileName.replace('.js', '')] = require(providerDir + fileName);
});

const getProviders = filterProvider => filterProvider ? [filterProvider] : Object.keys(providerApis);

const scrape = filterProvider => Promise.map(getProviders(filterProvider), provider => {
  const startedAt = new Date();

  return providerApis[provider]()
    .then(servers => ({
      meta: {
        provider,
        duration: (new Date()) - startedAt
      },
      servers,
    }))
    .catch(e => console.log(provider, e))
});

module.exports = filterProvider => scrape(filterProvider);
