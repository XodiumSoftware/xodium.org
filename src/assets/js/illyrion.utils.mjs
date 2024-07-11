// illyrion.utils.mjs

import { COMPONENTS_MAP } from "./illyrion.constants.mjs";

document.addEventListener("DOMContentLoaded", function () {
  const cache = {};

  async function loadComponent(componentName) {
    const file = COMPONENTS_MAP[componentName];
    if (!file) {
      throw new Error(`Component ${componentName} not found.`);
    }

    const $placeholders = document.querySelectorAll(
      `[data-component="${componentName}"]`
    );
    if (!$placeholders.length) {
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

    $placeholders.forEach((placeholder) => {
      placeholder.innerHTML = html;
    });
  }

  const $componentPromises = Object.keys(COMPONENTS_MAP).map((componentName) =>
    loadComponent(componentName)
  );

  Promise.all($componentPromises).catch((err) =>
    console.error("An unexpected error occurred while loading components:", err)
  );

  function initializeNavbarBurgers() {
    const $navbarBurgers = Array.from(
      document.querySelectorAll(".navbar-burger")
    );

    $navbarBurgers.forEach((el) => {
      if (!el.dataset.initialized) {
        el.addEventListener("click", () => {
          const $target = document.getElementById(el.dataset.target);

          el.classList.toggle("is-active");
          $target.classList.toggle("is-active");
        });

        el.dataset.initialized = true;
      }
    });
  }

  function initializeDropdownChevron() {
    const $toolsDropdown = document.querySelector(".navbar-item.has-dropdown");
    const $chevronIcon = document.getElementById("tools-chevron");

    if ($toolsDropdown && $chevronIcon) {
      if (!$toolsDropdown.dataset.initialized) {
        $toolsDropdown.addEventListener("mouseover", () => {
          $chevronIcon.classList.replace("fa-chevron-down", "fa-chevron-up");
        });

        $toolsDropdown.addEventListener("mouseout", () => {
          $chevronIcon.classList.replace("fa-chevron-up", "fa-chevron-down");
        });

        $toolsDropdown.dataset.initialized = true;
      }
    } else {
      if (!$toolsDropdown) {
        console.error("toolsDropdown element not found");
      }
      if (!$chevronIcon) {
        console.error("chevronIcon element not found");
      }
    }
  }

  const $observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.addedNodes.length) {
        initializeNavbarBurgers();
        initializeDropdownChevron();
      }
    });
  });

  $observer.observe(document.body, { childList: true, subtree: true });
});
