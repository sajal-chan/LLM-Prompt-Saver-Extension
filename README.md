# LLM Prompt Saver

A lightweight Chrome Extension to save, organize, and quickly inject prompts into popular LLM interfaces like ChatGPT, Claude, and Gemini.

## Features

- **Organize by Category:** Group your prompts by topic (e.g., Coding, Email, SEO).
- **One-Click Paste:** Instantly insert saved prompts into the active chat window.
- **Auto-Run:** Use the "Run" feature to paste and automatically submit the prompt.
- **Cross-Platform Support:** Pre-configured selectors for ChatGPT, Claude, and Gemini, with a generic fallback for other sites.
- **Local Storage:** All prompts are stored locally in your browser.

## Installation

1. Download or clone this repository.
2. Open Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer mode** in the top right corner.
4. Click **Load unpacked** and select the extension folder.

## Files

- `manifest.json`: Extension configuration and permissions.
- `popup.html`, `popup.js`, `style.css`: The user interface for managing and triggering prompts.
- `content.js`: The script responsible for interacting with the LLM web pages to inject text.
- `icons/`: Branding assets for the browser toolbar.
