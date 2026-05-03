import { State } from '../state.js';

export function setupFindbar() {
  let findMatches = [];
  let findIndex = -1;

  const toggleFindBar = () => {
    const bar = document.getElementById('find-bar');
    if (!bar) return;
    bar.classList.toggle('open');
    if (bar.classList.contains('open')) {
      const findInput = document.getElementById('find-input');
      if (findInput) {
        findInput.focus();
        findInput.select();
      }
    }
  };

  window.addEventListener('toggleFind', toggleFindBar);

  const findToggleBtn = document.getElementById('find-toggle-btn');
  if (findToggleBtn) {
    findToggleBtn.addEventListener('click', toggleFindBar);
  }

  function doFind(focusEditor = false, minIndexToFind = -1) {
    const q = document.getElementById('find-input').value;
    const ed = State.editor;
    const lbl = document.getElementById('find-count-lbl');
    findMatches = [];
    
    if (!q) { 
      if (lbl) lbl.textContent = ''; 
      findIndex = -1;
      return; 
    }
    
    let i = 0;
    const lowerVal = ed.value.toLowerCase();
    const lowerQ = q.toLowerCase();
    
    while ((i = lowerVal.indexOf(lowerQ, i)) !== -1) {
      findMatches.push(i);
      i += q.length;
    }
    
    if (findMatches.length) {
      if (minIndexToFind !== -1) {
        findIndex = findMatches.findIndex(m => m >= minIndexToFind);
        if (findIndex === -1) findIndex = 0;
      } else if (findIndex === -1 || findIndex >= findMatches.length) {
        findIndex = 0;
      }
      
      if (lbl) lbl.textContent = `${findIndex + 1}/${findMatches.length}`;
      highlightMatch(ed, q.length, focusEditor);
    } else {
      findIndex = -1;
      if (lbl) lbl.textContent = '0/0';
    }
  }

  function highlightMatch(ed, len, focusEditor = true) {
    const idx = findMatches[findIndex];
    if (idx === undefined) return;
    
    const lbl = document.getElementById('find-count-lbl');
    if (lbl) lbl.textContent = `${findIndex + 1}/${findMatches.length}`;
    
    // Set selection range first
    ed.setSelectionRange(idx, idx + len);
    
    // Only focus the editor if we want the highlight to be fully visible 
    // (We skip this while the user is actively typing to prevent hijacking their keyboard)
    if (focusEditor) {
      ed.focus();
    }
  }

  const findInput = document.getElementById('find-input');
  if (findInput) {
    findInput.addEventListener('input', () => {
      findIndex = -1; // Reset when search query changes
      doFind(false);
    });
    
    // Allow pressing Enter to find next
    findInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const nextBtn = document.getElementById('find-next-btn');
        if (nextBtn) nextBtn.click();
      }
    });
  }

  // When the document is edited, we must update the matches so the highlight
  // doesn't become misaligned with the text
  const ed = document.getElementById('editor');
  if (ed) {
    ed.addEventListener('input', () => {
      const bar = document.getElementById('find-bar');
      if (bar && bar.classList.contains('open')) {
        doFind(false);
      }
    });
  }

  const findPrevBtn = document.getElementById('find-prev-btn');
  if (findPrevBtn) {
    findPrevBtn.addEventListener('click', () => {
      if (!findMatches.length) return;
      const q = document.getElementById('find-input').value;
      findIndex = (findIndex - 1 + findMatches.length) % findMatches.length;
      highlightMatch(State.editor, q.length, true);
    });
  }

  const findNextBtn = document.getElementById('find-next-btn');
  if (findNextBtn) {
    findNextBtn.addEventListener('click', () => {
      if (!findMatches.length) return;
      const q = document.getElementById('find-input').value;
      findIndex = (findIndex + 1) % findMatches.length;
      highlightMatch(State.editor, q.length, true);
    });
  }

  const replaceBtn = document.getElementById('replace-btn');
  if (replaceBtn) {
    replaceBtn.addEventListener('click', () => {
      const q = document.getElementById('find-input').value;
      const r = document.getElementById('replace-input').value;
      if (!q || !findMatches.length) return;
      
      const ed = State.editor;
      const idx = findMatches[findIndex] ?? findMatches[0];
      
      ed.setRangeText(r, idx, idx + q.length, 'end');
      ed.dispatchEvent(new Event('input'));
      
      // Find the next occurrence strictly after the inserted text to avoid infinite loops
      const minNextIndex = idx + r.length;
      doFind(true, minNextIndex);
    });
  }

  const replaceAllBtn = document.getElementById('replace-all-btn');
  if (replaceAllBtn) {
    replaceAllBtn.addEventListener('click', () => {
      const q = document.getElementById('find-input').value;
      const r = document.getElementById('replace-input').value;
      if (!q) return;
      
      const ed = State.editor;
      
      // Case-insensitive regex replacement for Replace All
      const escapedQ = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escapedQ, 'gi');
      ed.value = ed.value.replace(regex, r);
      
      ed.dispatchEvent(new Event('input'));
      
      doFind(false);
    });
  }

  const findCloseBtn = document.querySelector('.find-close');
  if (findCloseBtn) {
    findCloseBtn.addEventListener('click', () => {
      const bar = document.getElementById('find-bar');
      if (bar) bar.classList.remove('open');
      
      const findInp = document.getElementById('find-input');
      const replaceInp = document.getElementById('replace-input');
      if (findInp) findInp.value = '';
      if (replaceInp) replaceInp.value = '';
      
      findMatches = []; 
      findIndex = -1;
      
      const lbl = document.getElementById('find-count-lbl');
      if (lbl) lbl.textContent = '';
      
      State.editor.focus();
    });
  }
}
