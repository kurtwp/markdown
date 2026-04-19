---
name: google-antigravity-tailwind
description: Creates a "Google Antigravity" effect using Tailwind CSS for layout and Vanilla JS for physics. Elements will fall, float, and be draggable.
---

# Google Antigravity Skill (Tailwind Edition)
This skill instructs the agent to build interactive physics-based web interfaces using Tailwind CSS and JavaScript.

## Implementation Steps
1. **Tailwind Setup**: 
   - Use the Tailwind CDN for quick prototyping or suggest a PostCSS config for production.
   - Ensure the main container is set to `relative w-full h-screen overflow-hidden bg-white`.
2. **HTML Structure**: 
   - Style elements (buttons, inputs, logos) using Tailwind classes like `absolute p-4 rounded shadow-lg`. 
   - Ensure elements are positioned `top-0 left-0` initially so JS can take over coordinates.
3. **JavaScript Engine**: 
   - **Physics Logic**: Implement gravity and collision detection using `requestAnimationFrame`.
   - **Interaction**: Enable dragging and tossing elements using mouse/touch events.
   - **Tailwind Integration**: Manipulate `transform: translate(x, y)` and `rotate(deg)` via the style object to keep Tailwind's layout intact.

## Design Rules
- **Utility First**: All styling must be done via Tailwind classes; avoid custom CSS blocks unless strictly necessary for the physics engine.
- **Responsiveness**: Use Tailwind’s responsive prefixes (e.g., `md:`, `lg:`) and update physics bounds on resize.

## Usage Prompt Example
"Build a Google landing page clone where all Tailwind-styled components fall to the bottom of the screen on click."
