// illyrion.componentsloader.mjs

import { COMPONENTS_MAP } from "./illyrion.constants.mjs";

document.addEventListener("DOMContentLoaded", function () {
  async function loadComponent(componentName) {
    const file = COMPONENTS_MAP[componentName];
    if (!file) {
      console.error(`Component ${componentName} not found.`);
      return;
    }

    const placeholders = document.querySelectorAll(
      `[data-component="${componentName}"]`
    );
    if (!placeholders.length) {
      return;
    }

    try {
      const response = await fetch(file);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const html = await response.text();
      placeholders.forEach((placeholder) => {
        placeholder.innerHTML = html;
      });
    } catch (err) {
      console.error(`Failed to load ${componentName}:`, err);
    }
  }

  Promise.all(Object.keys(COMPONENTS_MAP).map(loadComponent)).catch((err) =>
    console.error("An error occurred while loading components:", err)
  );
});
