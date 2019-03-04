module.exports = {
    oakfnd: {
        url: "http://oakfnd.org/grant-database.html",
        scraper: oakScraper
    }
};

async function oakScraper(page, url) {
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
