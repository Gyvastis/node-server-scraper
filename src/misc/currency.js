const fetch = require('node-fetch');

const getCurrencyRates = () => fetch("https://d2bhsbhm5ibqfe.cloudfront.net/prices.json", {
  "credentials": "omit",
  "headers": {
    "accept": "application/json, text/plain, */*",
    "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36"
  },
  "referrer": "https://www.namecheap.com/domains/registration/results.aspx?domain=njansdnjdas.com",
  "referrerPolicy": "no-referrer-when-downgrade",
  "body": null,
  "method": "GET",
  "mode": "cors"
})
.then(data => data.json())
.then(json => json.rates);

module.exports = getCurrencyRates;
