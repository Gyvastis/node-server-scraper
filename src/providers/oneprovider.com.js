const fetch = require('node-fetch');
const cheerio = require('cheerio');

const DomainFetch = searchDomain =>
  fetch("https://oneprovider.com/dedicated-servers/amsterdam-netherlands", {
    "credentials": "include",
    "headers": {
      "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
      "accept-language": "en-GB,en-US;q=0.9,en;q=0.8,nl;q=0.7,lt;q=0.6",
      "cache-control": "max-age=0",
      "if-modified-since": "Mon, 06 Jan 2020 21:05:04 GMT",
      "if-none-match": "W/\"1578344704\"",
      "sec-fetch-mode": "navigate",
      "sec-fetch-site": "same-origin",
      "sec-fetch-user": "?1",
      "upgrade-insecure-requests": "1"
    },
    "referrer": "https://oneprovider.com/dedicated-servers/dusseldorf-germany",
    "referrerPolicy": "no-referrer-when-downgrade",
    "body": null,
    "method": "GET",
    "mode": "cors"
  })
  .then(data => data.text())
  .then(text => {
    const $ = cheerio.load(text);
    let servers = [];

    $('body table > tbody > tr').map((i, $tr) => {
      let server = {};

      $($tr).find('td').map((j, $td) => {
        switch(j) {
          case 0:
            server.location = $($td).find('a').text().replace(/\s+/g, ' ').trim();
            break;
          case 1:
            server.cpu = $($td).text().replace(/\s+/g, ' ').trim();
            break;
          case 2:
            server.ram = $($td).text().replace(/\s+/g, ' ').trim();
            break;
          case 3:
            server.storage = $($td).text().replace(/\s+/g, ' ').trim();
            break;
          case 4:
            server.bandwidth = $($td).find('.number').text().replace(/\s+/g, ' ').trim();
            break;
          case 5:
            server.ip = $($td).text().replace(/\s+/g, ' ').trim();
            break;
          case 6:
            server.price = $($td).find('.currency-code-eur').text().replace(/\s+/g, ' ').trim();
            break;
          case 7:
            server.availability = $($td).find('a').attr('data-tooltip').replace(/\s+/g, ' ').trim();
            break;
        }

        servers.push(server);
      });
    });

    return {
      servers,
    };
  }).catch(e => console.log(provider, e));

module.exports = DomainFetch;
