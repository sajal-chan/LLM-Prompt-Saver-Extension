chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "insertText") {
        insertTextIntoChat(request.text, request.autoSubmit);
    }
});

function insertTextIntoChat(text, autoSubmit) {
    // 1. Identify the input box based on the website
    const url = window.location.hostname;
    let inputBox = null;
    let submitButton = null;

    // --- STRATEGY A: Domain Specific Selectors ---
    
    if (url.includes('chatgpt.com')) {
        inputBox = document.querySelector('#prompt-textarea');
        submitButton = document.querySelector('button[data-testid="send-button"]');
    } 
    else if (url.includes('claude.ai')) {
        inputBox = document.querySelector('div[contenteditable="true"]');
        // Claude's submit button is tricky, often relies on Enter key
        submitButton = document.querySelector('button[aria-label="Send Message"]');
    }
    else if (url.includes('gemini.google.com')) {
        inputBox = document.querySelector('div[role="textbox"]');
        submitButton = document.querySelector('.send-button-selector-here'); // Placeholder, often changes
    }

    // --- STRATEGY B: Generic Fallback (If specific didn't work) ---
    if (!inputBox) {
        inputBox = document.querySelector('textarea');
        if (!inputBox) inputBox = document.querySelector('div[contenteditable="true"]');
    }

    if (!inputBox) {
        alert("Could not find a chat box on this page.");
        return;
    }

    // 2. Insert the Text (Handling React/Virtual DOM quirks)
    inputBox.focus();

    // Determine if it's a standard input or contenteditable div
    if (inputBox.tagName === 'TEXTAREA' || inputBox.tagName === 'INPUT') {
        inputBox.value = text;
        // Dispatch 'input' event so React sees the change
        inputBox.dispatchEvent(new Event('input', { bubbles: true }));
    } else {
        // For contenteditable divs (Claude, Gemini, etc)
        inputBox.innerText = text; // or innerHTML
        inputBox.dispatchEvent(new Event('input', { bubbles: true }));
    }

    // 3. Handle Auto-Run
    if (autoSubmit) {
        setTimeout(() => {
            if (submitButton) {
                submitButton.click();
            } else {
                // If no button found, try simulating the Enter key
                const enterEvent = new KeyboardEvent('keydown', {
                    bubbles: true, cancelable: true, keyCode: 13, key: 'Enter'
                });
                inputBox.dispatchEvent(enterEvent);
            }
        }, 300); // Small delay to ensure text is registered
    }
}