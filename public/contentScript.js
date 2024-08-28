(function () {
  // Check if the script is already injected and running
  if (window.hasExtensionScriptLoaded) {
    console.log("Extension script already loaded.");
    return;
  }

  // Mark the script as loaded
  window.hasExtensionScriptLoaded = true;

  // Variable to store the dialog
  let dialog = null;

  function showDialog(translation) {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      console.log("Nothing was selected");
      return;
    }

    const dialogHtml = `${translation}<br><button id="close-dialog">OK</button>`;

    // Remove existing dialog if it exists
    if (dialog) {
      dialog.remove();
      dialog = null;
    }

    // Create new dialog
    dialog = document.createElement("dialog");
    dialog.innerHTML = dialogHtml;
    dialog.id = "my-dialog";
    dialog.open = true;
    dialog.style.cssText = "font-size: 16px; border: 1px solid #cccccc; z-index: 999;";

    const range = selection.getRangeAt(0);
    const parent = range.commonAncestorContainer.parentNode;
    parent?.appendChild(dialog);

    // Add event listener to close the dialog
    document.getElementById('close-dialog')?.addEventListener('click', () => {
      dialog?.remove();
      dialog = null;
    });
  }

  // Listen for messages and handle them
  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'TRANSLATE_TEXT') {
      showDialog(message.translation);
    }
  });
})();
