import { engine } from '../physics/engine.js';

export function setupInteractions() {
  document.addEventListener('mousedown', (e) => {
    if (!engine.active) return;
    
    // Find the closest physics element being clicked
    const item = engine.elements.find(i => {
      const rect = i.el.getBoundingClientRect();
      return e.clientX >= rect.left && e.clientX <= rect.right &&
             e.clientY >= rect.top && e.clientY <= rect.bottom;
    });

    if (item) {
      // Give it a random toss
      item.vx = (Math.random() - 0.5) * 40;
      item.vy = -Math.random() * 30;
    }
  });
}
