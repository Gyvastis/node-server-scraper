const fs = require('fs');
const providerDir = __dirname + '/providers/';
const getCurrencyRates = require('./misc/currency');

const providerApis = {};
fs.readdirSync(providerDir).forEach(fileName => {
  providerApis[fileName.replace('.js', '')] = require(providerDir + fileName);
});

const getSearchProviders = filterProvider => filterProvider ? [filterProvider] : Object.keys(providerApis);

const availabilitySearch = (domain, filterProvider) => Promise.all(
  getSearchProviders(filterProvider).map(provider => {
    const startedAt = new Date();

    return providerApis[provider](domain).then(data => ({
      ...data,
      meta: {
        provider,
        duration: (new Date()) - startedAt
      }
    })).catch(e => console.log(provider, e))
  }
));

module.exports = (domain, filterProvider) =>
  availabilitySearch(domain, filterProvider)
;
