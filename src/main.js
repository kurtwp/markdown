import { State } from './state.js';
import { setupEditor } from './ui/editor.js';
import { setupToolbar } from './ui/toolbar.js';
import { setupPanes } from './ui/panes.js';
import { setupStatusbar } from './ui/statusbar.js';

const STARTER = `# Welcome to ▶ md Editor

A clean, fast Markdown editor that renders **live** as you type. Now modularized for better performance and scalability!

## Features

- **Modular Architecture** — Follows clean code standards
- **Split view** — edit and preview side by side
- **Toolbar shortcuts** for common formatting
- **Auto-save** to localStorage
- **Word count** and cursor position in the status bar

---

*Start editing to replace this content.*
`;

document.addEventListener('DOMContentLoaded', () => {
  const editorEl = document.getElementById('editor');
  const previewEl = document.getElementById('preview');

  // Initialize State
  State.init(editorEl, previewEl);
  if (!State.content) {
    State.content = STARTER;
  }

  // Setup UI Components
  setupEditor();
  setupToolbar();
  setupPanes();
  setupStatusbar();

  // Initial render
  window.dispatchEvent(new CustomEvent('statsUpdated', { detail: State.stats }));
});
