const excludedUrls = [
    'pmhnam.github.io',
    'github.io'
];

let currentPageUrl = '';

function updateCurrentPageUrl() {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        if (tabs.length > 0) {
            const tab = tabs[0];
            if (tab && tab.url) {
                currentPageUrl = new URL(tab.url).hostname;
                console.log('Current page URL:', currentPageUrl);
            }
        }
    });
}

function isExcluded(url) {
    return excludedUrls.some(excludedUrl => url.startsWith(excludedUrl));
}

function saveUrl(url, title) {
    chrome.storage.local.get({ urls: [] }, function (result) {
        const urls = result.urls;
        const existingUrl = urls.find(({ url }) => url === url);
        if (existingUrl) return;
        urls.push({ url: url, title: title });
        chrome.storage.local.set({ urls });
    });
}

chrome.webRequest.onBeforeRequest.addListener(
    function (details) {
        if (details.url.includes('index.m3u8') && !isExcluded(currentPageUrl)) {
            chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                let tab = tabs[0];
                let title = tab.title ?? 'Untitled';
                console.log('Caught API call: ', details.url, ' from page: ', title);
                saveUrl(details.url, title);
            });
        }
    },
    { urls: ['<all_urls>'] }
);

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    if (changeInfo.status === 'complete') {
        updateCurrentPageUrl();
    }
});

updateCurrentPageUrl();
