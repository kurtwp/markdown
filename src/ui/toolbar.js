import { insertAround, insertLine, insertFence, insertLink, insertTable, insertChecklist, insertImage, downloadFile, copyHTML, openFile, clearEditor } from './editor.js';

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
  const FONT_KEY = 'md-editor-fontsize';
  const editorEl = document.getElementById('editor');
  let fontSize = parseInt(localStorage.getItem(FONT_KEY) || '14', 10);
  const applyFontSize = (s) => {
    fontSize = Math.min(Math.max(s, 10), 28);
    editorEl.style.fontSize = fontSize + 'px';
    localStorage.setItem(FONT_KEY, fontSize);
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

  // --- Find bar toggle (Ctrl+F from editor.js fires this) ---
  window.addEventListener('toggleFind', () => {
    const bar = document.getElementById('find-bar');
    bar.classList.toggle('open');
    if (bar.classList.contains('open')) {
      document.getElementById('find-input').focus();
    }
  });

  // --- Find & Replace logic ---
  let findMatches = [];
  let findIndex = -1;

  function doFind() {
    const q = document.getElementById('find-input').value;
    const ed = document.getElementById('editor');
    const lbl = document.getElementById('find-count-lbl');
    findMatches = [];
    findIndex = -1;
    if (!q) { if (lbl) lbl.textContent = ''; return; }
    let i = 0;
    while ((i = ed.value.indexOf(q, i)) !== -1) {
      findMatches.push(i);
      i += q.length;
    }
    if (lbl) lbl.textContent = findMatches.length ? `1/${findMatches.length}` : '0/0';
    if (findMatches.length) {
      findIndex = 0;
      highlightMatch(ed, q.length);
    }
  }

  function highlightMatch(ed, len) {
    const idx = findMatches[findIndex];
    if (idx === undefined) return;
    const lbl = document.getElementById('find-count-lbl');
    if (lbl) lbl.textContent = `${findIndex + 1}/${findMatches.length}`;
    ed.focus();
    ed.setSelectionRange(idx, idx + len);
  }

  document.getElementById('find-input').addEventListener('input', doFind);

  document.getElementById('find-prev-btn').addEventListener('click', () => {
    if (!findMatches.length) return;
    const q = document.getElementById('find-input').value;
    findIndex = (findIndex - 1 + findMatches.length) % findMatches.length;
    highlightMatch(document.getElementById('editor'), q.length);
  });

  document.getElementById('find-next-btn').addEventListener('click', () => {
    if (!findMatches.length) return;
    const q = document.getElementById('find-input').value;
    findIndex = (findIndex + 1) % findMatches.length;
    highlightMatch(document.getElementById('editor'), q.length);
  });

  document.getElementById('replace-btn').addEventListener('click', () => {
    const q = document.getElementById('find-input').value;
    const r = document.getElementById('replace-input').value;
    if (!q || !findMatches.length) return;
    const ed = document.getElementById('editor');
    const idx = findMatches[findIndex] ?? findMatches[0];
    ed.setRangeText(r, idx, idx + q.length, 'end');
    ed.dispatchEvent(new Event('input'));
    doFind();
  });

  document.getElementById('replace-all-btn').addEventListener('click', () => {
    const q = document.getElementById('find-input').value;
    const r = document.getElementById('replace-input').value;
    if (!q) return;
    const ed = document.getElementById('editor');
    ed.value = ed.value.split(q).join(r);
    ed.dispatchEvent(new Event('input'));
    doFind();
  });

  // --- Find bar close ---
  document.querySelector('.find-close').addEventListener('click', () => {
    document.getElementById('find-bar').classList.remove('open');
    document.getElementById('find-input').value = '';
    document.getElementById('replace-input').value = '';
    findMatches = []; findIndex = -1;
    const lbl = document.getElementById('find-count-lbl');
    if (lbl) lbl.textContent = '';
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
    const btn = document.getElementById('copy-menu-btn') || document.getElementById('copy-md-btn');
    if (!btn) return;
    const orig = btn.textContent;
    btn.textContent = '✓ Copied!';
    setTimeout(() => btn.textContent = orig, 1500);
  });
}
