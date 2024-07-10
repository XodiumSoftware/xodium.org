// componentsloader.mjs

import { COMPONENTS_MAP, COMPONENT } from "./illyrion.constants.mjs";

document.addEventListener("DOMContentLoaded", async function () {
  async function loadComponent(componentName) {
    const file = COMPONENTS_MAP[componentName];
    if (!file) {
      console.error(`Component ${componentName} not found.`);
      return;
    }

    const placeholder = `${componentName}${COMPONENT}`;
    const placeholderElement = document.getElementById(placeholder);
    if (!placeholderElement) {
      console.error(`Placeholder for ${componentName} not found.`);
      return;
    }

    try {
      const response = await fetch(file);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const html = await response.text();
      placeholderElement.innerHTML = html;
    } catch (err) {
      console.error(`Failed to load ${componentName}:`, err);
    }
  }

  Object.keys(COMPONENTS_MAP).forEach((component) => loadComponent(component));
});
