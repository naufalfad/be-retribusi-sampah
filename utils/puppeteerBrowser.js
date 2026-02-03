const puppeteer = require('puppeteer');

let browserInstance = null;

async function getBrowser() {
    if (!browserInstance) {
        browserInstance = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
    }
    return browserInstance;
}

// optional: untuk graceful shutdown
async function closeBrowser() {
    if (browserInstance) {
        await browserInstance.close();
        browserInstance = null;
    }
}

module.exports = {
    getBrowser,
    closeBrowser
};
