chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "USER_HIGHLIGHT") {
    console.log("User highlighted text:", message.text);
  }
});
