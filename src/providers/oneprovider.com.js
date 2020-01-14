const fetch = require('node-fetch');
const cheerio = require('cheerio');
const Promise = require('bluebird');

const LocationFetch = () =>
  fetch("https://oneprovider.com/dedicated-servers", {
    "credentials": "include",
    "headers": {
      "sec-fetch-mode": "navigate",
      "sec-fetch-site": "same-origin",
      "sec-fetch-user": "?1",
      "upgrade-insecure-requests": "1",
      "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.88 Safari/537.36"
    },
    "body": null,
    "method": "GET",
    "mode": "cors"
  })
  .then(data => data.text())
  .then(text => {
    const $ = cheerio.load(text);
    let locations = [];

    if($('.location-content').length > 0) {
      $('.location-content').map((i, location) => {
        const hrefSplit = $(location).find('a').attr('href').split('/');
        locations.push(hrefSplit[hrefSplit.length - 1]);
      });
    }

    return locations;
  });

const DomainFetch = location =>
  fetch(`https://oneprovider.com/dedicated-servers/${location}`, {
    "credentials": "include",
    "headers": {
      "sec-fetch-mode": "navigate",
      "sec-fetch-site": "same-origin",
      "sec-fetch-user": "?1",
      "upgrade-insecure-requests": "1"
    },
    "body": null,
    "method": "GET",
    "mode": "cors"
  })
  .then(data => data.text())
  .then(text => {
    console.log(location)
    const $ = cheerio.load(text);

    let servers = [];

    if($('body table > tbody > tr').length <= 0) {
      return { servers };
    }

    $('.drive-bundle-id').remove();
    $('body table > tbody > tr').map((i, tr) => {
      let server = {};
      const $tr = $(tr);

      $tr.find('td').map((j, td) => {
        const $td = $(td);

        switch (j) {
          case 0:
            server.location = {
              city: $td.find('.field-location-name').text(),
              country: $td.find('.field-location-country').text(),
            };
            break;
          case 1:
            server.cpu = {
              name: $td.find('.field-cpu-name').text(),
              freq: $td.find('.field-cpu-freq').text(),
              cores: parseInt($td.find('.field-cpu-core').text().replace(' cores', '')),
            };
            break;
          case 2:
            server.ram = {};
            server.ram.version = $td.text().replace(/\s+/g, ' ').trim();
            server.ram.amout = server.ram.version.replace(/\sDDR\d/g, '').split(' ');
            server.ram.unit = server.ram.amout[1];
            server.ram.amout = server.ram.amout[0];
            server.ram.version = server.ram.version.match(/DDR\d/g)[0];
            break;
          case 3:
            server.storage = $td.text().replace(/\s+/g, ' ').trim();
            server.storage = server.storage.replace('and', 'or'); // todo: fix
            server.storage = server.storage.split('or').map(s => s.trim()).filter(s => s !== '');
            // console.log(server.storage)
            server.storage = server.storage.map(s => {
              const match = s.match(/(?<amount>\d{1,}).\s(?<size>\d+\.?\d*)\s(?<unit>\w{2})\s\((?<type>\w{3})\s?\(?\w*\)?\s(?<conn_type>\w+)\)/);
              return match.groups;
            });
            server.storage = server.storage.map(s => ({ ...s }));
            break;
          case 4:
            server.bandwidth = $td.find('.number').text().replace(/\s+/g, ' ').trim();
            break;
          case 5:
            server.ip = parseInt($td.text().replace(/\s+/g, ' ').trim());
            break;
          case 6:
            server.price = $td.find('.currency-code-eur').text().replace(/\s+/g, ' ').trim();
            server.price = server.price.split(' ').map(p => Math.round(parseFloat(p.replace('€', ''))));
            break;
          case 7:
            server.available = $td.find('a').attr('data-tooltip').replace(/\s+/g, ' ').trim() === 'In Stock';
            break;
        }
      });

      servers.push(server);
    });

    return {
      servers,
    };
  }).catch(e => console.log(location, e));

module.exports = async (filterLocation = null) => {
  let locations = (await LocationFetch());
  console.log(locations.length)

  if(filterLocation) {
    locations = locations.filter(location => filterLocation === location);
  }

  return Promise.map(locations, location => DomainFetch(location), { concurrency: 1 })
    .then(data => {
      let mergedData = [];

      data.forEach(dataItem => dataItem.servers.map(server => mergedData.push(server)));
      console.log(mergedData.length);

      return { servers: mergedData };
    });
};
