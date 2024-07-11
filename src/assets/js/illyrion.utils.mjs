// illyrion.utils.mjs

import { COMPONENTS_MAP } from "./illyrion.constants.mjs";

class ComponentLoader {
  constructor(componentMap) {
    this.componentMap = componentMap;
    this.cache = {};
  }

  async loadComponent(componentName) {
    const file = this.componentMap[componentName];
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
    if (this.cache[componentName]) {
      html =
        this.cache[componentName] instanceof Promise
          ? await this.cache[componentName]
          : this.cache[componentName];
    } else {
      this.cache[componentName] = fetch(file).then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.text();
      });
      html = await this.cache[componentName];
    }

    placeholders.forEach((placeholder) => {
      placeholder.innerHTML = html;
    });
  }
}

class NavbarBurger {
  initialize() {
    const navbarBurgers = Array.from(
      document.querySelectorAll(".navbar-burger")
    );

    navbarBurgers.forEach((el) => {
      if (!el.dataset.initialized) {
        el.addEventListener("click", () => {
          const target = document.getElementById(el.dataset.target);

          el.classList.toggle("is-active");
          target.classList.toggle("is-active");
        });

        el.dataset.initialized = true;
      }
    });
  }
}

class DropdownChevron {
  initialize() {
    const toolsDropdown = document.querySelector(".navbar-item.has-dropdown");
    const chevronIcon = document.getElementById("tools-chevron");

    if (toolsDropdown && chevronIcon) {
      if (!toolsDropdown.dataset.initialized) {
        toolsDropdown.addEventListener("mouseover", () => {
          chevronIcon.classList.replace("fa-chevron-down", "fa-chevron-up");
        });

        toolsDropdown.addEventListener("mouseout", () => {
          chevronIcon.classList.replace("fa-chevron-up", "fa-chevron-down");
        });

        toolsDropdown.dataset.initialized = true;
      }
    } else {
      if (!toolsDropdown) {
        console.error("toolsDropdown element not found");
      }
      if (!chevronIcon) {
        console.error("chevronIcon element not found");
      }
    }
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const componentLoader = new ComponentLoader(COMPONENTS_MAP);
  const navbarBurger = new NavbarBurger();
  const dropdownChevron = new DropdownChevron();

  Object.keys(COMPONENTS_MAP).forEach((componentName) =>
    componentLoader.loadComponent(componentName)
  );

  navbarBurger.initialize();
  dropdownChevron.initialize();

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.addedNodes.length) {
        navbarBurger.initialize();
        dropdownChevron.initialize();
      }
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });
});
