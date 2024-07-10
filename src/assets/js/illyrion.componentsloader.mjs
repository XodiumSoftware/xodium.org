// illyrion.componentsloader.mjs

import { COMPONENTS_MAP } from "./illyrion.constants.mjs";

document.addEventListener("DOMContentLoaded", function () {
  async function loadComponent(componentName) {
    const file = COMPONENTS_MAP[componentName];
    if (!file) {
      console.error(`Component ${componentName} not found.`);
      return;
    }

    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_COMMENT,
      {
        acceptNode: function (node) {
          return node.nodeValue.trim() === `{${componentName}}`
            ? NodeFilter.FILTER_ACCEPT
            : NodeFilter.FILTER_REJECT;
        },
      }
    );

    const placeholderNode = walker.nextNode();
    if (!placeholderNode) {
      return;
    }

    try {
      const response = await fetch(file);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const html = await response.text();
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = html;
      while (tempDiv.firstChild) {
        placeholderNode.parentNode.insertBefore(
          tempDiv.firstChild,
          placeholderNode
        );
      }
      placeholderNode.parentNode.removeChild(placeholderNode);
    } catch (err) {
      console.error(`Failed to load ${componentName}:`, err);
    }
  }

  Promise.all(Object.keys(COMPONENTS_MAP).map(loadComponent)).catch((err) =>
    console.error("An error occurred while loading components:", err)
  );
});
