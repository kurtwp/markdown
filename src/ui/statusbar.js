export function setupStatusbar() {
  window.addEventListener('statsUpdated', (e) => {
    const stats = e.detail;
    document.getElementById('stat-words').textContent = stats.words;
    document.getElementById('stat-lines').textContent = stats.lines;
    document.getElementById('stat-chars').textContent = stats.chars;
    document.getElementById('stat-ln').textContent = stats.ln;
    document.getElementById('stat-col').textContent = stats.col;
  });
}
