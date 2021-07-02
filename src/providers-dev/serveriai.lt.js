const fetch = require('node-fetch');
const cheerio = require('cheerio');
const scrapeIt = require('scrape-it');

const ProviderFetch = () =>
    fetch('https://www.dedikuoti.lt/');

const OneFetch = () =>
    ProviderFetch()
        .then(response => response.text())
        .then(text => cheerio.load(text))
        .then($ => scrapeIt.scrapeHTML($, {
            details: {
                listItem: '#plan_lin table tr:first-child',
                data: {
                    cpu: {
                        selector: 'th:nth-child(3) a',
                        attr: 'title',
                    },
                    memoryType: {
                        selector: 'th:nth-child(4) a',
                        attr: 'title',
                    },
                    storageType: {
                        selector: 'th:nth-child(5) a',
                        attr: 'title',
                    },
                    bandwidthSpeed: {
                        selector: 'th:nth-child(6) a',
                        attr: 'title',
                    }
                }
            },
            servers: {
                listItem: '#plan_lin table tr:not(:first-child)',
                data: {
                    cpu: {
                        selector: '.unit_cpu',
                        convert: x => x.split(' x '),
                    },
                    memory: {
                        selector: '.unit_ram',
                        convert: x => x.split(' '),
                    },
                    storage: {
                        selector: '.unit_quota',
                        convert: x => x.split(' '),
                    },
                    bandwidthLimit: {
                        selector: '.unit_bandwidth',
                        convert: x => x.split('/')[0].split(' '),
                    },
                    price: {
                        selector: 'td:last-child',
                        convert: x => x.split(' '),
                    },
                },
            },
        })).then(({ details, servers }) => {
            const serversAll = servers.map(server => ({
                location: {
                    country: 'Lithuania',
                    city: 'Vilnius',
                },
                cpu: {
                    amount: 1,
                    brand: 'Intel',
                    name: 'Xeon Gold 6132',
                    frequency: server.cpu[1],
                    cores: server.cpu[0],
                },
                memory: {
                    value: server.memory[0],
                    unit: server.memory[1],
                    type: 'DDR4',
                },
                storage: [{
                    amount: 1,
                    value: server.storage[0],
                    unit: server.storage[1],
                    type: 'HDD',
                    connType: 'SATA'
                }],
                bandwidthSpeed: {
                    value: 100,
                    unit: 'Mbps',
                },
                bandwidthLimit: {
                    value: parseInt(server.bandwidthLimit[0]),
                    unit: server.bandwidthLimit[1],
                },
                price: {
                    value: parseFloat(server.price[0]),
                    unit: 'EUR',
                },
                available: true,
            }))

        serversAll.forEach(server => {
            serversAll.push({
                ...server,
                price: {
                    ...server.price,
                    value: server.price.value + 1.0
                },
                bandwidthSpeed: {
                    value: 1,
                    unit: 'Gbps',
                },
            });
            serversAll.push({
                ...server,
                price: {
                    ...server.price,
                    value: server.price.value + 1.0
                },
                storage: [{
                    ...server.storage[0],
                    type: 'SSD',
                }],
            });
            serversAll.push({
                ...server,
                price: {
                    ...server.price,
                    value: server.price.value + 2.0
                },
                bandwidthSpeed: {
                    value: 1,
                    unit: 'Gbps',
                },
                storage: [{
                    ...server.storage[0],
                    type: 'SSD',
                }],
            });
        })

        return serversAll;
    });

module.exports = OneFetch;
