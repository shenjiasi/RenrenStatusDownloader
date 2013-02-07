chrome.browserAction.onClicked.addListener(function (tab) {
    chrome.tabs.executeScript(null, { file: "FileSaver.min.js" });
    chrome.tabs.executeScript(null, { file: "exportRenrenStatus.js" });
});
