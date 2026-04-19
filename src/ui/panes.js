import { State } from '../state.js';

export function setupPanes() {
  const divider = document.getElementById('divider');
  const editorPane = document.getElementById('editor-pane');
  const previewPane = document.getElementById('preview-pane');
  const workspace = document.getElementById('workspace');

  let dragging = false, startX, startEditorW;

  divider.addEventListener('mousedown', e => {
    dragging = true;
    startX = e.clientX;
    startEditorW = editorPane.getBoundingClientRect().width;
    divider.classList.add('dragging');
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  });

  document.addEventListener('mousemove', e => {
    if (!dragging) return;
    const totalW = workspace.getBoundingClientRect().width - 5;
    const newW = Math.min(Math.max(startEditorW + (e.clientX - startX), 200), totalW - 200);
    const pct = (newW / totalW * 100).toFixed(1);
    editorPane.style.flex = `0 0 ${pct}%`;
    previewPane.style.flex = `0 0 ${100 - parseFloat(pct)}%`;
  });

  document.addEventListener('mouseup', () => {
    if (!dragging) return;
    dragging = false;
    divider.classList.remove('dragging');
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  });

  // View toggle logic
  document.querySelectorAll('.view-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const mode = btn.id.replace('vbtn-', '');
      setView(mode);
    });
    btn.removeAttribute('onclick');
  });
}

export function setView(mode) {
  document.body.className = 'view-' + mode;
  document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
  const target = document.getElementById('vbtn-' + mode);
  if (target) target.classList.add('active');
  State.viewMode = mode;
}
