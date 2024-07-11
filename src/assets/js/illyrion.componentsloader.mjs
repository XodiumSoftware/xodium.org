// illyrion.componentsloader.mjs

import { COMPONENTS_MAP } from "./illyrion.constants.mjs";

document.addEventListener("DOMContentLoaded", function () {
  const cache = {};

  async function loadComponent(componentName) {
    const file = COMPONENTS_MAP[componentName];
    if (!file) {
      throw new Error(`Component ${componentName} not found.`);
    }

    const placeholders = document.querySelectorAll(
      `[data-component="${componentName}"]`
    );
    if (!placeholders.length) {
      return;
    }

    let html;
    if (cache[componentName]) {
      html =
        cache[componentName] instanceof Promise
          ? await cache[componentName]
          : cache[componentName];
    } else {
      cache[componentName] = fetch(file).then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.text();
      });
      html = await cache[componentName];
    }

    placeholders.forEach((placeholder) => {
      placeholder.innerHTML = html;
    });
  }

  const componentPromises = Object.keys(COMPONENTS_MAP).map((componentName) =>
    loadComponent(componentName)
  );

  Promise.all(componentPromises).catch((err) =>
    console.error("An unexpected error occurred while loading components:", err)
  );
});
