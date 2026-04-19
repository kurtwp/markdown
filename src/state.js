export const State = {
  editor: null,
  preview: null,
  content: '',
  stats: {
    words: 0,
    lines: 0,
    chars: 0,
    ln: 1,
    col: 1
  },
  viewMode: 'split',
  isDragging: false,
  saveTimer: null,

  init(editorEl, previewEl) {
    this.editor = editorEl;
    this.preview = previewEl;
    this.load();
  },

  updateContent(val) {
    this.content = val;
    this.updateStats();
  },

  updateStats() {
    const val = this.content;
    this.stats.words = val.trim() === '' ? 0 : val.trim().split(/\s+/).length;
    this.stats.lines = val.split('\n').length;
    this.stats.chars = val.length;
    this.updateCursorPos();
  },

  updateCursorPos() {
    const val = this.content;
    const pos = this.editor.selectionStart;
    const before = val.substring(0, pos);
    this.stats.ln = before.split('\n').length;
    this.stats.col = before.split('\n').pop().length + 1;
  },

  save() {
    localStorage.setItem('md-editor-content', this.content);
  },

  load() {
    const saved = localStorage.getItem('md-editor-content');
    if (saved !== null) {
      this.content = saved;
    }
  }
};
