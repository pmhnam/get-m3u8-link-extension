
// Danh sách các trang web cần loại trừ (chỉ định URL gốc của trang web)
const excludedUrls = [
    'pmhnam.github.io',
    'github.io'
];

// Biến lưu trữ URL của trang hiện tại
let currentPageUrl = "";

// Cập nhật URL của trang hiện tại
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

// Cập nhật URL của trang hiện tại khi extension khởi động
updateCurrentPageUrl();

// Hàm kiểm tra xem URL của trang hiện tại có nằm trong danh sách loại trừ không
function isExcluded(url) {
    return excludedUrls.some(excludedUrl => url.startsWith(excludedUrl));
}

// Lưu trữ các URL và tiêu đề của trang
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
        // Kiểm tra nếu URL của trang hiện tại không nằm trong danh sách loại trừ
        if (details.url.includes("index.m3u8") && !isExcluded(currentPageUrl)) {
            chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                let tab = tabs[0];
                let title = tab.title;
                console.log("Caught API call: ", details.url, " from page: ", title);
                saveUrl(details.url, title);
            });
        }
    },
    { urls: ["<all_urls>"] }
);

// Cập nhật URL của trang hiện tại khi tab được cập nhật
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    if (changeInfo.status === 'complete') {
        updateCurrentPageUrl();
    }
});
