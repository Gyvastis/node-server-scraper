const fetch = require('node-fetch');
const cheerio = require('cheerio');
const scrapeIt = require('scrape-it')
const Promise = require('bluebird');

// todo: include correct (robot) user-agent

const ProviderFetch = url => fetch(url, {
  "headers": {
    "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
    "accept-language": "en-GB,en-US;q=0.9,en;q=0.8,nl;q=0.7,lt;q=0.6",
    "cache-control": "max-age=0",
    "if-modified-since": "Sun, 18 Oct 2020 08:34:02 GMT",
    "if-none-match": "W/\"1603010042\"",
    "sec-fetch-dest": "document",
    "sec-fetch-mode": "navigate",
    "sec-fetch-site": "same-origin",
    "sec-fetch-user": "?1",
    "sec-gpc": "1",
    "upgrade-insecure-requests": "1",
    "cookie": "__cfduid=da30b316c5c45a2bd24792c493c36ed291603010443; cookie-policy=seen"
  },
  "referrer": "https://oneprovider.com/",
  "referrerPolicy": "strict-origin-when-cross-origin",
  "body": null,
  "method": "GET",
  "mode": "cors"
});

const ListFetch = () =>
  ProviderFetch('https://oneprovider.com/dedicated-servers')
  .then(body => body.text())
  .then(text => cheerio.load(text))
  .then($ => scrapeIt.scrapeHTML($, {
    urls: {
      listItem: '.location-container',
      data: {
        url: {
          selector: 'a',
          attr: 'href'
        }
      }
    }
  }))
  .then(({ urls }) => urls.map(url => url.url));

const OneFetch = uri => 
  ProviderFetch(`https://oneprovider.com${uri}`)
  .then(body => body.text())
  .then(text => cheerio.load(text))
  .then($ => scrapeIt.scrapeHTML($, {
    servers: {
      listItem: '#results-wrapper .results-tr',
      data: {
        country: {
          selector: '.field-location-country',
          how: 'text',
        },
        city: {
          selector: '.field-location-name',
          how: 'text',
        },
        cpuAmount: {
          selector: '.res-cpu',
          attr: 'class',
          convert: x => parseInt(x.split('cpu-amount-')[1])
        },
        cpuBrand: {
          selector: '.res-cpu .cpu',
          attr: 'class',
          convert: x => x.split('cpu-')[1]
        },
        cpuName: {
          selector: '.field-cpu-name'
        },
        cpuFreq: {
          selector: '.field-cpu-freq'
        },
        cpuCores: {
          selector: '.field-cpu-core',
          convert: x => parseInt(x.split(' ')[0])
        }
      }
    }
  }))
  .then(({ servers }) => servers);

module.exports = async () => {
  const urls = await ListFetch();
  // console.log(urls)

  return await Promise.map(urls.slice(0, 1), url => OneFetch(url), { concurrency: 1 });
}