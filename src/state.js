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
  
  history: [],
  historyIndex: -1,
  lastInputTime: 0,
  isRestoring: false,

  init(editorEl, previewEl) {
    this.editor = editorEl;
    this.preview = previewEl;
    this.load();
    this.pushHistory(true);
  },

  updateContent(val) {
    this.content = val.replace(/\r/g, '');
    this.updateStats();
    if (!this.isRestoring) {
      this.pushHistory();
    }
  },

  pushHistory(force = false) {
    const now = Date.now();
    const currentState = {
      val: this.content,
      start: this.editor ? this.editor.selectionStart : 0,
      end: this.editor ? this.editor.selectionEnd : 0
    };
    
    if (this.historyIndex >= 0 && this.history[this.historyIndex].val === currentState.val) {
      return;
    }

    if (!force && this.historyIndex >= 0 && (now - this.lastInputTime) < 500) {
      this.history[this.historyIndex] = currentState;
      this.lastInputTime = now;
      return;
    }

    if (this.historyIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.historyIndex + 1);
    }

    this.history.push(currentState);
    if (this.history.length > 200) {
      this.history.shift();
    } else {
      this.historyIndex++;
    }
    this.lastInputTime = now;
  },

  undo() {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      this.applyHistoryState(this.history[this.historyIndex]);
    }
  },

  redo() {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      this.applyHistoryState(this.history[this.historyIndex]);
    }
  },

  applyHistoryState(state) {
    this.isRestoring = true;
    this.content = state.val;
    if (this.editor) {
      this.editor.value = state.val;
      this.editor.selectionStart = state.start;
      this.editor.selectionEnd = state.end;
      this.editor.dispatchEvent(new Event('input'));
    }
    this.updateStats();
    this.isRestoring = false;
  },

  updateStats() {
    const val = this.content;
    this.stats.words = (val.match(/\S+/g) || []).length;
    this.stats.lines = val.split('\n').length;
    this.stats.chars = val.length;
    this.updateCursorPos();
  },

  updateCursorPos() {
    const val = this.content;
    const pos = this.editor ? this.editor.selectionStart : 0;
    const before = val.substring(0, pos);
    const lineMatches = before.match(/\n/g);
    this.stats.ln = (lineMatches ? lineMatches.length : 0) + 1;
    this.stats.col = before.length - before.lastIndexOf('\n');
  },

  save() {
    try {
      localStorage.setItem('md-editor-content', this.content);
    } catch (e) {
      console.warn('Unable to save to localStorage', e);
    }
  },

  load() {
    try {
      const saved = localStorage.getItem('md-editor-content');
      if (saved !== null) {
        this.content = saved.replace(/\r/g, '');
      }
    } catch (e) {
      console.warn('Unable to read from localStorage', e);
    }
  }
};
