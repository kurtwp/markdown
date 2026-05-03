import { State } from '../state.js';

export function setupEditor() {
  const editor = document.getElementById('editor');
  const preview = document.getElementById('preview');

  if (typeof marked !== 'undefined') {
    marked.setOptions({ breaks: true, gfm: true });
  } else {
    console.warn('marked.js is not loaded. Markdown preview will be disabled.');
  }

  editor.value = State.content;
  renderPreview();

  let renderTimer;
  editor.addEventListener('input', () => {
    State.updateContent(editor.value);
    
    clearTimeout(renderTimer);
    renderTimer = setTimeout(() => {
      renderPreview();
    }, 150);

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
    if (typeof marked !== 'undefined') {
      preview.innerHTML = marked.parse(State.content);
    } else {
      preview.innerHTML = `<div style="color:red; padding:20px;">Error: Markdown parser not loaded.</div>`;
    }
  }

  function saveContent() {
    State.save();
    const ind = document.getElementById('saved-indicator');
    if (ind) {
      ind.classList.add('show');
      setTimeout(() => ind.classList.remove('show'), 1500);
    }
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
      State.pushHistory(true);
    }
    if (e.key === 'z' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      if (e.shiftKey) {
        State.redo();
      } else {
        State.undo();
      }
    }
    if (e.key === 'y' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      State.redo();
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
  const editor = State.editor;
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
  State.pushHistory(true);
}

export function insertLine(prefix) {
  const editor = State.editor;
  const start = editor.selectionStart;
  const val = editor.value;
  const lineStart = val.lastIndexOf('\n', start - 1) + 1;
  editor.setRangeText(prefix, lineStart, lineStart, 'end');
  editor.focus();
  editor.dispatchEvent(new Event('input'));
  State.pushHistory(true);
}

export function insertFence() {
  const editor = State.editor;
  const start = editor.selectionStart;
  const end = editor.selectionEnd;
  const val = editor.value;
  const sel = val.substring(start, end);
  
  // Check if we are at the start of a line
  const isStartOfLine = start === 0 || val[start - 1] === '\n';
  const prefix = isStartOfLine ? '```\n' : '\n```\n';
  
  const replacement = prefix + (sel || 'code here') + '\n```\n';
  editor.setRangeText(replacement, start, end, 'select');
  editor.focus();
  editor.dispatchEvent(new Event('input'));
  State.pushHistory(true);
}

export function insertTable() {
  const editor = State.editor;
  const start = editor.selectionStart;
  const tbl = '\n| Header 1 | Header 2 | Header 3 |\n| --- | --- | --- |\n| Cell | Cell | Cell |\n| Cell | Cell | Cell |\n';
  editor.setRangeText(tbl, start, start, 'end');
  editor.focus();
  editor.dispatchEvent(new Event('input'));
  State.pushHistory(true);
}

export function insertChecklist() {
  const editor = State.editor;
  const start = editor.selectionStart;
  const val = editor.value;
  const lineStart = val.lastIndexOf('\n', start - 1) + 1;
  editor.setRangeText('- [ ] ', lineStart, lineStart, 'end');
  editor.focus();
  editor.dispatchEvent(new Event('input'));
  State.pushHistory(true);
}

export function insertImage() {
  const editor = State.editor;
  const url = prompt('Image URL:', 'https://');
  if (!url) return;
  const alt = prompt('Alt text:', 'image') || 'image';
  const start = editor.selectionStart;
  const end = editor.selectionEnd;
  const replacement = `![${alt}](${url})`;
  editor.setRangeText(replacement, start, end, 'end');
  editor.focus();
  editor.dispatchEvent(new Event('input'));
  State.pushHistory(true);
}

export function insertLink() {
  const editor = State.editor;
  const start = editor.selectionStart;
  const end = editor.selectionEnd;
  const sel = editor.value.substring(start, end) || 'link text';
  const replacement = '[' + sel + '](https://example.com)';
  editor.setRangeText(replacement, start, end, 'end');
  editor.focus();
  editor.dispatchEvent(new Event('input'));
  State.pushHistory(true);
}

export function clearEditor() {
  const editor = State.editor;
  const preview = State.preview;

  State.updateContent('');
  editor.value = '';
  if (preview) preview.innerHTML = '';
  State.pushHistory(true);
  State.save();

  // Notify stats
  window.dispatchEvent(new CustomEvent('statsUpdated', { detail: State.stats }));
}

export function downloadFile() {
  const blob = new Blob([State.content], { type: 'text/markdown' });
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
  const preview = State.preview;
  if (!preview) return;
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
      const editor = State.editor;
      editor.value = e.target.result;
      editor.dispatchEvent(new Event('input'));
      State.pushHistory(true);
    };
    reader.readAsText(file);
  });
  input.click();
}
