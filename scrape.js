
const puppeteer = require('puppeteer');
const scrapeStrategies = require('./scrape-strategies.js');
const fs = require('fs');

let outputStrategy = 'console';  // Can be 'console' or 'json'
let scrapeStrategy;

// Check arguments for configuration
if (!process.argv[2] || !scrapeStrategies[process.argv[2]]) {
    logUsage(scrapeStrategies);
}
else {
    scrapeStrategy = scrapeStrategies[process.argv[2]];
}

if (process.argv[3] == '--output') {
    if (process.argv[4] == 'json') {
        outputStrategy = 'json'
    }
    else {
        console.log('Please provide a valid output strategy: \'json\' (default is console)');
        process.exit();
    }
}
else if (process.argv[3] && process.argv[3] != '--output') {
    logUsage(scrapeStrategies);
}


async function scraper(scrapeStrategy) {  
    // TODO: Check if robots.txt exists and make sure the url is not disallowed.

    //let url = scrapeStrategy.url;
    let url = `file://${__dirname}/cache/oakfnd-page1.html`; // Using local URL for demo.
    let scrapeResults = scrapeStrategy.scraper(puppeteer, url);

    scrapeResults
    .then(data => {
        if (outputStrategy == 'json') {
            fs.writeFile('results.json', JSON.stringify(data), err => {
                if (err) {
                    return console.error(err);
                }

                console.log('File \'results.json\' created.');
            })
        }
        else {
            console.log(data);
        }
    })
    .catch(err => {
        console.error(err);
    });
}

function logUsage(strats) {
    console.log('USAGE: node scrape <name-of-scraping-strategy> [--output <output channel>]');
    console.log('List of available strategies:');
    console.log('===============');
    let strategies = Object.keys(strats);
    for (strategy of strategies) {
        console.log(strategy);
    }
    console.log('===============');
    process.exit();
}

scraper(scrapeStrategy);