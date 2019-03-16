## Scraper demo using puppeteer

### Structure

Scrape strategies are defined in the `scrape-strategies.js` file. They are comprised of the url to be scraped as well as the specific scraping function for the particular site to be scraped.

In the file `scrape.js` is where the actual scraping happens, depending on the selected scrape-strategy, as well as some other logic.

### Usage

1. `npm install`
2. `node scrape <scrape-strategy> [--output <output-strategy>]`

Run `node scrape` to get a list of available scrape-strategies.
