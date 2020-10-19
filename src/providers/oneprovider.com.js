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
        },
        memValue: {
          selector: '.res-memory .digits',
          convert: x => parseInt(x)
        },
        memUnit: {
          selector: '.res-memory .unit'
        },
        memType: {
          selector: '.res-memory > :nth-child(2)'
        },
        storage: {
          selector: '.res-storage',
          convert: x => x.replace(/\s+/g, ' ')
            .split(' or ')
            .map(storage => storage.trim())
            .filter(storage => storage !== '*Base Storage')
            .map(storage => storage.split(' ').map(storageValue => storageValue.replace(/[\(\)]/g, '')))
        },
        bandwidthSpeedValue: {
          selector: '.res-bandwidth > :nth-child(1) .digits',
          convert: x => parseInt(x)
        },
        bandwidthSpeedUnit: {
          selector: '.res-bandwidth > :nth-child(1) .unit'
        },
        bandwidthLimitValue: {
          selector: '.res-bandwidth > :nth-child(2) .digits',
          convert: x => parseInt(x)
        },
        bandwidthLimitUnit: {
          selector: '.res-bandwidth > :nth-child(2) .unit'
        },
        priceNormalValue: {
          selector: '.res-price .currency-code-usd .price-normal',
        },
        priceNewValue: {
          selector: '.res-price .currency-code-usd .price-new-amount',
        },
        priceUnit: {
          selector: '.res-price .currency-code-usd .price-normal .price-sign'
        },
        available: {
          selector: '.res-stock .res-tooltip',
          attr: 'data-tooltip',
          convert: x => x.toLowerCase() !== 'sold out'
        }
      }
    }
  }))
  .then(({ servers }) => servers.map(server => ({
    location: {
      country: server.country,
      city: server.city,
    },
    cpu: {
      amount: server.cpuAmount,
      brand: server.cpuBrand,
      name: server.cpuName,
      frequency: server.cpuFreq,
      cores: server.cpuCores,
    },
    memory: {
      value: server.memValue,
      unit: server.memUnit,
      type: server.memType,
    },
    storage: server.storage.map(storage => ({
      amount: parseInt(storage[0]),
      value: parseInt(storage[1]),
      unit: storage[2],
      type: storage[3],
      connType: storage[4]
    })),
    bandwidthSpeed: {
      value: server.bandwidthSpeedValue,
      unit: server.bandwidthSpeedUnit,
    },
    bandwidthLimit: {
      value: server.bandwidthLimitValue,
      unit: server.bandwidthLimitUnit,
    },
    price: {
      value: parseFloat(server.priceNewValue > 0 ? server.priceNewValue.replace(server.priceUnit, '') : server.priceNormalValue.replace(server.priceUnit, '')),
      unit: 'USD',
    },
    available: server.available,
  })));

module.exports = async () => {
  const urls = await ListFetch();
  let currentUrl = 0;
  const totalUrls = urls.length

  return await Promise.map(urls, url => OneFetch(url)
    .then(servers => {
      console.log(`[${++currentUrl}/${totalUrls}] https://oneprovider.com${url}`)
      return servers;
    }), { concurrency: 1 })
    .then(serversGrouped => {
      const serversMerged = [];

      serversGrouped.forEach(servers => {
        servers.forEach(server => {
          serversMerged.push(server)
        });
      });

      return serversMerged;
    });
}
