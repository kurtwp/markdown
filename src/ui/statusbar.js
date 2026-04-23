export function setupStatusbar() {
  window.addEventListener('statsUpdated', (e) => {
    const stats = e.detail;
    document.getElementById('stat-words').textContent = stats.words;
    document.getElementById('stat-lines').textContent = stats.lines;
    document.getElementById('stat-chars').textContent = stats.chars;
    document.getElementById('stat-ln').textContent = stats.ln;
    document.getElementById('stat-col').textContent = stats.col;

    // Reading time: ~200 wpm
    const mins = Math.max(1, Math.round(stats.words / 200));
    const rtEl = document.getElementById('stat-readtime');
    if (rtEl) rtEl.textContent = mins + ' min read';
  });
}
