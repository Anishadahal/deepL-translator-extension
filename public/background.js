chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "translate-menu",
    title: "Translate %s",
    contexts: ["selection"],
  });
});

async function callDeepL(
  text,
  sourceLang,
  targetLang
) {
  const languageCodes = {
    Bulgarian: "BG",
    Czech: "CS",
    Danish: "DA",
    German: "DE",
    Greek: "EL",
    English: "EN",
    Spanish: "ES",
    Estonian: "ET",
    Finnish: "FI",
    French: "FR",
    Hungarian: "HU",
    Indonesian: "ID",
    Italian: "IT",
    Japanese: "JA",
    Korean: "KO",
    Lithuanian: "LT",
    Latvian: "LV",
    Norwegian: "NB",
    Dutch: "NL",
    Polish: "PL",
    Portuguese: "PT",
    Romanian: "RO",
    Russian: "RU",
    Slovak: "SK",
    Slovenian: "SL",
    Swedish: "SV",
    Turkish: "TR",
    Ukrainian: "UK",
    Chinese: "ZH",
  };

  const API_KEY = `DEEPL_API_KEY`; //secret
  const API_URL = "https://api-free.deepl.com/v2/translate";

  const headers = new Headers({
    Authorization: `DeepL-Auth-Key ${API_KEY}`,
    "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
  });

  const body = new URLSearchParams({
    text: text,
    source_lang: languageCodes[sourceLang],
    target_lang: languageCodes[targetLang],
  });

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers,
      body,
    });
    const json = await response.json();
    if (json.message) {
      return `DeepL message: ${json.message}`;
    }
    return json.translations[0].text;
  } catch (error) {
    return `DeepL error: ${
      error instanceof Error ? error.message : "Unknown error"
    }`;
  }
}

// background.ts
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (!info.selectionText || !tab?.id) return;

  const { from, to } = (await chrome.storage.local.get(["from", "to"]))
  const sourceLang = from || "English";
  const targetLang = to || "Japanese";
  const translation = await callDeepL(
    info.selectionText,
    sourceLang,
    targetLang
  );

  // Ensure tab ID and script injection
  if (tab.id) {
    chrome.scripting.executeScript(
      {
        target: { tabId: tab.id },
        files: ["contentScript.js"], // Inject content script if not already injected
      },
      () => {
        chrome.tabs.sendMessage(
          tab.id,
          { type: "TRANSLATE_TEXT", translation },
          (response) => {
            if (chrome.runtime.lastError) {
              console.error(chrome.runtime.lastError.message);
            } else {
              console.log("Message sent successfully", response);
            }
          }
        );
      }
    );
  }
});
