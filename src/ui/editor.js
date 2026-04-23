import { State } from '../state.js';

export function setupEditor() {
  const editor = document.getElementById('editor');
  const preview = document.getElementById('preview');

  marked.setOptions({ breaks: true, gfm: true });

  editor.value = State.content;
  renderPreview();

  editor.addEventListener('input', () => {
    State.updateContent(editor.value);
    renderPreview();
    notifyStats();

    clearTimeout(State.saveTimer);
    State.saveTimer = setTimeout(saveContent, 800);
  });

  editor.addEventListener('keydown', handleKeydown);
  editor.addEventListener('click', () => {
    State.updateCursorPos();
    notifyStats();
  });
  editor.addEventListener('keyup', () => {
    State.updateCursorPos();
    notifyStats();
  });

  function renderPreview() {
    preview.innerHTML = marked.parse(State.content);
  }

  function saveContent() {
    State.save();
    const ind = document.getElementById('saved-indicator');
    ind.classList.add('show');
    setTimeout(() => ind.classList.remove('show'), 1500);
  }

  function notifyStats() {
    window.dispatchEvent(new CustomEvent('statsUpdated', { detail: State.stats }));
  }

  function handleKeydown(e) {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = editor.selectionStart;
      editor.setRangeText('  ', start, start, 'end');
      editor.dispatchEvent(new Event('input'));
    }
    if (e.key === 'f' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      window.dispatchEvent(new CustomEvent('toggleFind'));
    }
    if (e.key === 's' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      saveContent();
      downloadFile();
    }
  }
}

export function insertAround(before, after) {
  const editor = document.getElementById('editor');
  const start = editor.selectionStart;
  const end = editor.selectionEnd;
  const sel = editor.value.substring(start, end);
  const replacement = before + (sel || 'text') + after;
  editor.setRangeText(replacement, start, end, 'select');
  editor.focus();
  if (start === end) {
    editor.selectionStart = start + before.length;
    editor.selectionEnd = start + before.length + 4;
  }
  editor.dispatchEvent(new Event('input'));
}

export function insertLine(prefix) {
  const editor = document.getElementById('editor');
  const start = editor.selectionStart;
  const val = editor.value;
  const lineStart = val.lastIndexOf('\n', start - 1) + 1;
  editor.setRangeText(prefix, lineStart, lineStart, 'end');
  editor.focus();
  editor.dispatchEvent(new Event('input'));
}

export function insertFence() {
  const editor = document.getElementById('editor');
  const start = editor.selectionStart;
  const end = editor.selectionEnd;
  const sel = editor.value.substring(start, end);
  const replacement = '\n```\n' + (sel || 'code here') + '\n```\n';
  editor.setRangeText(replacement, start, end, 'select');
  editor.focus();
  editor.dispatchEvent(new Event('input'));
}

export function insertTable() {
  const editor = document.getElementById('editor');
  const start = editor.selectionStart;
  const tbl = '\n| Header 1 | Header 2 | Header 3 |\n| --- | --- | --- |\n| Cell | Cell | Cell |\n| Cell | Cell | Cell |\n';
  editor.setRangeText(tbl, start, start, 'end');
  editor.focus();
  editor.dispatchEvent(new Event('input'));
}

export function insertChecklist() {
  const editor = document.getElementById('editor');
  const start = editor.selectionStart;
  const val = editor.value;
  const lineStart = val.lastIndexOf('\n', start - 1) + 1;
  editor.setRangeText('- [ ] ', lineStart, lineStart, 'end');
  editor.focus();
  editor.dispatchEvent(new Event('input'));
}

export function insertImage() {
  const editor = document.getElementById('editor');
  const url = prompt('Image URL:', 'https://');
  if (!url) return;
  const alt = prompt('Alt text:', 'image') || 'image';
  const start = editor.selectionStart;
  const end = editor.selectionEnd;
  const replacement = `![${alt}](${url})`;
  editor.setRangeText(replacement, start, end, 'end');
  editor.focus();
  editor.dispatchEvent(new Event('input'));
}

export function insertLink() {
  const editor = document.getElementById('editor');
  const start = editor.selectionStart;
  const end = editor.selectionEnd;
  const sel = editor.value.substring(start, end) || 'link text';
  const replacement = '[' + sel + '](https://example.com)';
  editor.setRangeText(replacement, start, end, 'end');
  editor.focus();
  editor.dispatchEvent(new Event('input'));
}

export function clearEditor() {
  const editor = document.getElementById('editor');
  const preview = document.getElementById('preview');

  State.updateContent('');
  editor.value = '';
  preview.innerHTML = '';
  State.save();

  // Notify stats
  window.dispatchEvent(new CustomEvent('statsUpdated', { detail: State.stats }));
}

export function downloadFile() {
  const editor = document.getElementById('editor');
  const blob = new Blob([editor.value], { type: 'text/markdown' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  const now = new Date();
  const stamp = now.getFullYear() + '-' +
    String(now.getMonth() + 1).padStart(2, '0') + '-' +
    String(now.getDate()).padStart(2, '0');
  a.download = `document-${stamp}.md`;
  a.click();
}

export function copyHTML() {
  const preview = document.getElementById('preview');
  navigator.clipboard.writeText(preview.innerHTML).then(() => {
    const btn = document.getElementById('copy-menu-btn') || document.getElementById('copy-html-btn');
    if (!btn) return;
    const orig = btn.textContent;
    btn.textContent = '✓ Copied!';
    setTimeout(() => btn.textContent = orig, 1500);
  });
}

export function openFile() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.md,.txt,.markdown';
  input.addEventListener('change', () => {
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const editor = document.getElementById('editor');
      editor.value = e.target.result;
      editor.dispatchEvent(new Event('input'));
    };
    reader.readAsText(file);
  });
  input.click();
}
