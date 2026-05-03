import { insertAround, insertLine, insertFence, insertLink, insertTable, insertChecklist, insertImage, downloadFile, copyHTML, openFile, clearEditor } from './editor.js';

export function setupToolbar() {
  // --- Theme toggle (persisted to localStorage) ---
  const themeBtn = document.getElementById('theme-toggle');
  const applyTheme = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    if (themeBtn) {
      themeBtn.textContent = theme === 'light' ? '🌙' : '☀️';
    }
    try {
      localStorage.setItem('md-editor-theme', theme);
    } catch (e) {}
  };
  // Restore saved theme on load
  let savedTheme = 'dark';
  try {
    savedTheme = localStorage.getItem('md-editor-theme') || 'dark';
  } catch (e) {}
  applyTheme(savedTheme);
  
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      applyTheme(current === 'light' ? 'dark' : 'light');
    });
  }

  // --- Formatting buttons: use data-action attributes set in HTML ---
  document.querySelectorAll('.tb-btn[data-action]').forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.action;
      const arg1 = btn.dataset.arg1 ?? '';
      const arg2 = btn.dataset.arg2 ?? '';

      switch (action) {
        case 'insertAround': insertAround(arg1, arg2); break;
        case 'insertLine': insertLine(arg1); break;
        case 'insertFence': insertFence(); break;
        case 'insertLink': insertLink(); break;
        case 'insertTable': insertTable(); break;
        case 'insertChecklist': insertChecklist(); break;
        case 'insertImage': insertImage(); break;
      }
    });
  });

  // --- Copy buttons ---
  const copyMdBtn = document.getElementById('copy-md-btn');
  const copyHtmlBtn = document.getElementById('copy-html-btn');
  if (copyMdBtn) copyMdBtn.addEventListener('click', copyMarkdown);
  if (copyHtmlBtn) copyHtmlBtn.addEventListener('click', copyHTML);

  // --- Save / Download ---
  const saveBtn = document.getElementById('save-btn');
  if (saveBtn) {
    saveBtn.addEventListener('click', downloadFile);
  }

  // --- Clear button ---
  const clearBtn = document.getElementById('clear-btn');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to clear the current document?')) {
        clearEditor();
      }
    });
  }

  // --- Open File ---
  const openBtn = document.getElementById('open-btn');
  if (openBtn) openBtn.addEventListener('click', openFile);

  // --- Font size controls ---
  setupFontControl();
}

function setupFontControl() {
  const FONT_KEY = 'md-editor-fontsize';
  const editorEl = document.getElementById('editor');
  if (!editorEl) return;
  
  let fontSize = 14;
  try {
    fontSize = parseInt(localStorage.getItem(FONT_KEY) || '14', 10);
  } catch (e) {}
  
  const applyFontSize = (s) => {
    fontSize = Math.min(Math.max(s, 10), 28);
    editorEl.style.fontSize = fontSize + 'px';
    try {
      localStorage.setItem(FONT_KEY, fontSize);
    } catch (e) {}
    
    const select = document.getElementById('font-size-select');
    if (select) select.value = fontSize.toString();
  };
  
  applyFontSize(fontSize);
  
  const fontSizeSelect = document.getElementById('font-size-select');
  if (fontSizeSelect) {
    fontSizeSelect.addEventListener('change', (event) => {
      const value = parseInt(event.target.value, 10);
      if (!Number.isNaN(value)) applyFontSize(value);
    });
  }
}

function copyMarkdown() {
  const editorEl = document.getElementById('editor');
  if (!editorEl) return;
  navigator.clipboard.writeText(editorEl.value).then(() => {
    const btn = document.getElementById('copy-menu-btn') || document.getElementById('copy-md-btn');
    if (!btn) return;
    const orig = btn.textContent;
    btn.textContent = '✓ Copied!';
    setTimeout(() => btn.textContent = orig, 1500);
  });
}
