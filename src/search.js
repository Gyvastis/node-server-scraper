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

    //todo: deny if longer than 2 seconds
    return providerApis[provider](domain).then(data => ({
      ...data,
      meta: {
        provider,
        duration: (new Date()) - startedAt
      }
    })).catch(e => console.log(provider, e))
  }
));

const convertCurrency = async (dataArray = []) => {
  const currencyRates = await getCurrencyRates();

  return dataArray.map((data = {}) => ({
    ...data,
    currency: 'EUR',
    price: data.price ? (currencyRates[data.currency] * data.price).toFixed(2) : null,
    renewal: data.renewal ? (currencyRates[data.currency] * data.renewal).toFixed(2) : null,
  })).map(data => ({
    ...data,
    meta: {
      ...data.meta,
      price2: (parseFloat(data.price) + parseFloat(data.renewal)).toFixed(2)
    }
  }));
};

module.exports = (domain, filterProvider) =>
  availabilitySearch(domain, filterProvider)
    // .then(searchResults => searchResults.filter((searchResult = {}) => !!searchResult.domain))
    // .then(convertCurrency)
;
