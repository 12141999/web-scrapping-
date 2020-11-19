const fs = require('fs');
const puppeteer = require('puppeteer');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

//csv file setup
const csvWriter = createCsvWriter({
    path: 'out.csv',
    header: [
        { id: 'Username', title: 'Username' },
        { id: 'Title', title: 'Title' },
        { id: 'Body', title: 'Body' },
        { id: 'Date', title: 'Date' }
    ]
});



const data = [];

function extractItems() {
    const title = document.querySelectorAll('div[class = "u-letterSpacingTight u-lineHeightTighter u-breakWord u-textOverflowEllipsis u-lineClamp3 u-fontSize24"]');

    const items = [];
    for (let element of title) {
        items.push(element.innerText);
    }
    return items;
}

function extractTitlea() {
    const title1 = document.querySelectorAll('div[class = "u-fontSize24 u-xs-fontSize18"]');

    const items = [];
    for (let element of title1) {
        items.push(element.innerText);
    }
    return items;
}

function extractUsername() {
    const username = document.querySelectorAll('div[class = "postMetaInline postMetaInline-authorLockup ui-captionStrong u-flex1 u-noWrapWithEllipsis"] > a');
    const items = [];

    console.log("king of kings (robin jain)");

    for (let element of username) {
        items.push(element.innerText);
    }
    return items;
}

function extractDate() {
    const date = document.querySelectorAll('div[class = "ui-caption u-fontSize12 u-baseColor--textNormal u-textColorNormal js-postMetaInlineSupplemental"] > time');
    const items = [];
    for (let element of date) {
        items.push(element.innerText);
    }
    return items;
}

function extractBody() {
    const body = document.querySelectorAll('div[class = "u-fontSize18 u-letterSpacingTight u-lineHeightTight u-marginTop7 u-textColorNormal u-baseColor--textNormal"]');

    const items = [];
    for (let element of body) {
        items.push(element.innerText);
    }

    return items;
}

function extractBodya() {
    const body1 = document.querySelectorAll('div[class = "u-fontSize18 u-xs-fontSize16"]');

    const items = [];
    
    for (let element of body1) {
        items.push(element.innerText);
    }
    return items;
}


async function scrapeInfiniteScrollItems(
    page,
    extractItems,
    itemTargetCount,
    scrollDelay = 1000,
) {
    let items = [];
    try {
        let previousHeight;
        while (items.length < itemTargetCount) {
            items = await page.evaluate(extractItems);
            previousHeight = await page.evaluate('document.body.scrollHeight');
            await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
            await page.waitForFunction(`document.body.scrollHeight > ${previousHeight}`);
            await page.waitFor(scrollDelay);
        }
    } catch (e) { }
    return items;
}

(async () => {
    // Set up browser and page.
    const browser = await puppeteer.launch({
        headless: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    page.setViewport({ width: 1280, height: 926 });

    // Navigate to the demo page.
    await page.goto('https://uxdesign.cc/', { waitUntil: 'domcontentloaded' });

    // Scroll and extract items from the page.
       const title1 = await scrapeInfiniteScrollItems(page, extractItems, 500);
       const title2 = await scrapeInfiniteScrollItems(page, extractTitlea, 500);
       const username = await scrapeInfiniteScrollItems(page, extractUsername, 500);
       const date = await scrapeInfiniteScrollItems(page, extractDate, 500);
       const body1 = await scrapeInfiniteScrollItems(page, extractBody, 500);
       const body2 = await scrapeInfiniteScrollItems(page, extractBodya, 500);


    //for fixing a bug
    username.splice(3, 1);
    let title = title1.concat(title2);
    let body = body1.concat(body2);

    for(let i=0;i<98;i++)
    {
        data.push({
            Username : username[i],
            Title : title[i],
            Body : body[i],
            Date : date[i]
        });
    }

   console.log(title);

    // Save extracted items to a file.
    fs.writeFileSync('./items.txt', date.join('\n') + '\n');


    

    csvWriter
    .writeRecords(data)
    .then(() => console.log('The CSV file was written successfully'));

    // Close the browser.
    await browser.close();
})();
