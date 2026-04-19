## Architecture & Modularization

To maintain a clean codebase, follow these rules for code splitting:

- **File Limit**: If `app.js` or any individual script exceeds 200 lines, automatically propose a modularization plan.
- **Folder Structure**:
  - `src/physics/`: Logic for gravity, bounds detection, and collisions.
  - `src/interactions/`: Mouse/touch events and "toss" mechanics.
  - `src/ui/`: Tailwind component initializers and DOM manipulation.
- **ES Modules**: Always use `import` and `export` to connect files.
- **Shared State**: Use a centralized `State.js` or a global object to sync physics coordinates across different modules.
