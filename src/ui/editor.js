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
  a.download = 'document.md';
  a.click();
}
