import { insertAround, insertLine, insertFence, insertLink, downloadFile, clearEditor } from './editor.js';

export function setupToolbar() {
  // --- Theme toggle (persisted to localStorage) ---
  const themeBtn = document.getElementById('theme-toggle');
  const applyTheme = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    themeBtn.textContent = theme === 'light' ? '🌙' : '☀️';
    localStorage.setItem('md-editor-theme', theme);
  };
  // Restore saved theme on load
  const savedTheme = localStorage.getItem('md-editor-theme') || 'dark';
  applyTheme(savedTheme);
  themeBtn.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    applyTheme(current === 'light' ? 'dark' : 'light');
  });

  // --- Formatting buttons: use data-action attributes set in HTML ---
  document.querySelectorAll('.tb-btn[data-action]').forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.action;
      const arg1 = btn.dataset.arg1 ?? '';
      const arg2 = btn.dataset.arg2 ?? '';

      switch (action) {
        case 'insertAround': insertAround(arg1, arg2); break;
        case 'insertLine':   insertLine(arg1);          break;
        case 'insertFence':  insertFence();              break;
        case 'insertLink':   insertLink();               break;
      }
    });
  });

  // --- Copy Markdown ---
  const copyMdBtn = document.getElementById('copy-md-btn');
  if (copyMdBtn) {
    copyMdBtn.addEventListener('click', copyMarkdown);
  }

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

  // --- Find bar toggle (Ctrl+F from editor.js fires this) ---
  window.addEventListener('toggleFind', () => {
    const bar = document.getElementById('find-bar');
    bar.classList.toggle('open');
    if (bar.classList.contains('open')) {
      document.getElementById('find-input').focus();
    }
  });

  // --- Find input search ---
  document.getElementById('find-input').addEventListener('input', function() {
    const q = this.value;
    if (!q) return;
    const editorEl = document.getElementById('editor');
    const idx = editorEl.value.indexOf(q);
    if (idx !== -1) {
      editorEl.focus();
      editorEl.setSelectionRange(idx, idx + q.length);
    }
  });

  // --- Find bar close ---
  document.querySelector('.find-close').addEventListener('click', () => {
    document.getElementById('find-bar').classList.remove('open');
    document.getElementById('find-input').value = '';
  });

  // --- View toggle buttons ---
  document.querySelectorAll('.view-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const mode = btn.id.replace('vbtn-', '');
      document.body.className = 'view-' + mode;
      document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
}

function copyMarkdown() {
  const editorEl = document.getElementById('editor');
  navigator.clipboard.writeText(editorEl.value).then(() => {
    const btn = document.getElementById('copy-md-btn');
    const orig = btn.textContent;
    btn.textContent = '✓ Copied!';
    setTimeout(() => btn.textContent = orig, 1500);
  });
}
