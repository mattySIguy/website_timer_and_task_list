// background.js
let activeTabId = null;
let timerInterval = null;

// Function to start tracking time
function startTracking(tabId) {
    activeTabId = tabId;
    
    chrome.storage.local.get(['timeSpent', 'dailyTimeLimit', 'currentDate'], (data) => {
        const currentDate = new Date().toDateString();
        let timeSpent = 0;
        const dailyTimeLimit = parseInt(data.dailyTimeLimit) || 60;

        if (data.currentDate === currentDate) {
            timeSpent = data.timeSpent || 0;
        }

        // Clear existing interval if any
        if (timerInterval) {
            clearInterval(timerInterval);
        }

        // Start a new interval
        timerInterval = setInterval(() => {
            if (timeSpent < dailyTimeLimit) {
                timeSpent += (1/60); // Increment by 1 second
                chrome.storage.local.set({
                    timeSpent: timeSpent,
                    currentDate: currentDate
                });
            } else {
                clearInterval(timerInterval);
                blockWebsite(tabId);
            }
        }, 1000); // Update every second
    });
}

// Function to stop tracking time
function stopTracking() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    activeTabId = null;
}

// Listen for tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url.includes('linkedin.com')) {
        startTracking(tabId);
    }
});

// Listen for tab closure or navigation away
chrome.tabs.onRemoved.addListener((tabId) => {
    if (tabId === activeTabId) {
        stopTracking();
    }
});

chrome.tabs.onActivated.addListener((activeInfo) => {
    chrome.tabs.get(activeInfo.tabId, (tab) => {
        if (tab.url && tab.url.includes('linkedin.com')) {
            startTracking(activeInfo.tabId);
        } else {
            stopTracking();
        }
    });
});

// Function to notify user
function notifyUser(message) {
    chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icon.png',
        title: 'Productivity Monitor',
        message: message,
    });
}

// Function to block website
function blockWebsite(tabId) {
    chrome.tabs.update(tabId, { url: 'blocked.html' }); // Redirect to a blocking page
}