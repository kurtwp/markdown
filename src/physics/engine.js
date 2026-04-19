import { State } from '../state.js';

export class PhysicsEngine {
  constructor() {
    this.elements = [];
    this.gravity = 0.5;
    this.active = false;
    this.onUpdate = null;
  }

  toggle() {
    this.active = !this.active;
    if (this.active) {
      this.initElements();
      this.loop();
    } else {
      this.reset();
    }
    return this.active;
  }

  initElements() {
    // We'll target toolbar buttons and UI elements for the effect
    const targets = document.querySelectorAll('.tb-btn, .copy-btn, .toolbar-brand, .view-btn, .pane-label');
    this.elements = Array.from(targets).map(el => {
      const rect = el.getBoundingClientRect();
      const parentRect = el.offsetParent ? el.offsetParent.getBoundingClientRect() : null;
      
      // Store initial style for reset - use getAttribute to get raw inline styles
      const origStyle = el.getAttribute('style') || '';
      const origTransform = el.style.transform || '';

      return {
        el: el,
        origStyle,
        origTransform,
        x: rect.left - (parentRect ? parentRect.left : 0),
        y: rect.top - (parentRect ? parentRect.top : 0),
        vx: (Math.random() - 0.5) * 5,
        vy: (Math.random() - 0.5) * 5,
        w: rect.width,
        h: rect.height,
        parentW: parentRect ? parentRect.width : window.innerWidth,
        parentH: parentRect ? parentRect.height : window.innerHeight
      };
    });

    this.elements.forEach(item => {
      // Apply absolute positioning only AFTER all rects are captured
      item.el.style.position = 'absolute';
      item.el.style.left = '0';
      item.el.style.top = '0';
      item.el.style.margin = '0'; // Prevent margin interference
      item.el.style.zIndex = '1000';
      // Initial position
      item.el.style.transform = `translate(${item.x}px, ${item.y}px)`;
    });
  }

  loop() {
    if (!this.active) return;

    this.elements.forEach(item => {
      // Apply gravity
      item.vy += this.gravity;
      
      // Move
      item.x += item.vx;
      item.y += item.vy;

      // Friction
      item.vx *= 0.99;
      item.vy *= 0.99;

      // Bounds detection
      if (item.y + item.h > item.parentH) {
        item.y = item.parentH - item.h;
        item.vy *= -0.6; // Bounce
        item.vx *= 0.8;  // Ground friction
      }

      if (item.x < 0) {
        item.x = 0;
        item.vx *= -0.6;
      } else if (item.x + item.w > item.parentW) {
        item.x = item.parentW - item.w;
        item.vx *= -0.6;
      }

      // Update DOM
      item.el.style.transform = `translate(${item.x}px, ${item.y}px)`;
    });

    requestAnimationFrame(() => this.loop());
  }

  reset() {
    this.elements.forEach(item => {
      // Restore the full original style attribute
      if (item.origStyle) {
        item.el.setAttribute('style', item.origStyle);
      } else {
        item.el.removeAttribute('style');
      }
    });
    this.elements = [];
  }
}

export const engine = new PhysicsEngine();
