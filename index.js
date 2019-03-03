
const puppeteer = require('puppeteer');
const urls = require('./urls.js');

// console.log(process.argv);

async function scrapePage(url) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    // TODO: Check if robots.txt exists and make sure the url is not disallowed.

    console.log('Navigating to page ' + url);
    await page.goto(url);
    await page.waitForSelector('a.paginate_button.next'); // Waits for table to be available

    let scrapeResults = [];
    let nextPage = true;

    while (nextPage) {
        let partialResults = await page.evaluate(() => {
            const HEADERS_SELECTOR = '#mt-table-connect_u1430834 thead th';
            const ROWS_SELECTOR = '#mt-table-connect_u1430834 tbody tr[role="row"]';
            const headers = document.querySelectorAll(HEADERS_SELECTOR);
            const trows = document.querySelectorAll(ROWS_SELECTOR);

            let fields = [];

            headers.forEach(header => {
                fields.push(header.innerText);
            });

            let data = [];

            trows.forEach(row => {
                let rowData = row.querySelectorAll('td');
                let cellData = {};

                for (let i = 0; i < fields.length; i++) {
                    let field = fields[i];
                    cellData[field] = rowData[i].innerText;
                }

                data.push(cellData);
            });

            return data;
        });

        scrapeResults = [...scrapeResults, ...partialResults];

        try {
            
            let nextUrl = await page.evaluate(() => {
                let nextPageLink = document.querySelector('a.paginate_button.next');
                let linkUrl = nextPageLink.getAttribute('href');

                return linkUrl;
            });

            let fullUrl = `file://${__dirname}/cache/${nextUrl}`;
            console.log('Navigating to next page... ' + fullUrl);
            await page.goto(fullUrl);
        }
        catch (err) {
            console.log('Couldn\'t navigate to next page');
            nextPage = false;
        }
    }

    browser.close();
    return scrapeResults;
}

// local url: file://${__dirname}/cache/cache-example.html
let content = scrapePage(`file://${__dirname}/cache/oakfnd-page1.html`);

content.then(data => {
    console.log('');
    //console.log(JSON.stringify(data));
    console.log('');
    console.log('Objects read: ' + data.length);
    process.exit();
}).catch(err => {
    console.error(err);
    process.exit();
});