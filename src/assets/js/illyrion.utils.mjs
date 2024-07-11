// illyrion.utils.mjs

function initializeNavbarBurgers() {
  const $navbarBurgers = Array.from(
    document.querySelectorAll(".navbar-burger")
  );

  $navbarBurgers.forEach((el) => {
    if (!el.dataset.initialized) {
      el.addEventListener("click", () => {
        const target = el.dataset.target;
        const $target = document.getElementById(target);

        el.classList.toggle("is-active");
        $target.classList.toggle("is-active");
      });

      el.dataset.initialized = true;
    }
  });
}

function initializeDropdownChevron() {
  const toolsDropdown = document.querySelector(".navbar-item.has-dropdown");
  const chevronIcon = document.getElementById("tools-chevron");

  if (toolsDropdown && chevronIcon) {
    if (!toolsDropdown.dataset.initialized) {
      toolsDropdown.addEventListener("mouseover", () => {
        chevronIcon.classList.remove("fa-chevron-down");
        chevronIcon.classList.add("fa-chevron-up");
      });

      toolsDropdown.addEventListener("mouseout", () => {
        chevronIcon.classList.remove("fa-chevron-up");
        chevronIcon.classList.add("fa-chevron-down");
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

document.addEventListener("DOMContentLoaded", () => {
  initializeNavbarBurgers();

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.addedNodes.length) {
        initializeNavbarBurgers();
        initializeDropdownChevron();
      }
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });
});
