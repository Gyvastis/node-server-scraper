const fs = require('fs');
const providerDir = __dirname + '/providers/';
const Promise = require('bluebird');

const providerApis = {};
fs.readdirSync(providerDir).forEach(fileName => {
  providerApis[fileName.replace('.js', '')] = require(providerDir + fileName);
});

const getProviders = filterProvider => filterProvider ? [filterProvider] : Object.keys(providerApis);

const scrape = filterProvider => Promise.map(getProviders(filterProvider), provider => {
  const startedAt = new Date();

  return providerApis[provider]()
    .then(data => ({
      ...data,
      meta: {
        provider,
        duration: (new Date()) - startedAt
      }
    }))
    .catch(e => console.log(provider, e))
});

module.exports = filterProvider => scrape(filterProvider);
