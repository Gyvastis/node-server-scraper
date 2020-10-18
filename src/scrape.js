const fs = require('fs');
const Promise = require('bluebird');
const _ = require("lodash");
const providerDir = __dirname + '/providers/';

const providerApis = {};
fs.readdirSync(providerDir).forEach(fileName => {
  providerApis[fileName.replace('.js', '')] = require(providerDir + fileName);
});

const getProviders = filterProvider => filterProvider ? [filterProvider] : Object.keys(providerApis);

const scrape = filterProvider => Promise.map(getProviders(filterProvider), provider => {
  const startedAt = new Date();

  return providerApis[provider]()
    .then(data => ({
      data: data,
      meta: {
        provider,
        duration: (new Date()) - startedAt
      }
    }))
    .catch(e => console.log(provider, e))
}).then(servers => {
  let mergedServers = [];

  servers.forEach(serversArray => {
    mergedServers = _.concat(mergedServers, serversArray);
  });

  return mergedServers;
});

module.exports = filterProvider => scrape(filterProvider);
