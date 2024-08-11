

const mediaPlayerBaseUrl = 'https://pmhnam.github.io/media-player';


document.addEventListener('DOMContentLoaded', function () {
    const apiList = document.getElementById('api-list');
    const emptyMessage = document.querySelector('.empty-message');

    // Function to remove a URL from storage and update the popup
    function removeUrl(urlToRemove) {
        chrome.storage.local.get({ urls: [] }, function (result) {
            let urls = result.urls;
            urls = urls.filter(url => url.url !== urlToRemove);
            chrome.storage.local.set({ urls: urls }, function () {
                renderApiCalls(); // Re-render the list after removal
            });
        });
    }

    // Function to render the API calls list
    function renderApiCalls() {
        chrome.storage.local.get({ urls: [] }, function (result) {
            const urls = result.urls;
            apiList.innerHTML = ''; // Clear the list
            if (urls.length === 0) {
                emptyMessage.style.display = 'block';
            } else {
                emptyMessage.style.display = 'none';
                urls.forEach(({ url, title }) => {
                    const li = document.createElement('li');
                    const link = document.createElement('a');
                    link.href = `${mediaPlayerBaseUrl}?v=${encodeURIComponent(url)}`;
                    link.textContent = title;
                    link.target = '_blank'; // Mở liên kết trong tab mới
                    const deleteBtn = document.createElement('span');
                    deleteBtn.textContent = 'x'; // Biểu tượng "X"
                    deleteBtn.className = 'delete-btn';
                    deleteBtn.addEventListener('click', function () {
                        removeUrl(url);
                    });
                    li.appendChild(link);
                    li.appendChild(deleteBtn);
                    apiList.appendChild(li);
                });
            }
        });
    }

    // Render the API calls list on load
    renderApiCalls();
});
