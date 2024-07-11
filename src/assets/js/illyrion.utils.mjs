// illyrion.utils.mjs

class ContentSwapper {
  constructor() {
    const links = document.querySelectorAll("[data-toggle]");
    const sections = document.querySelectorAll("[data-section]");

    function toggleSections(showSectionData) {
      sections.forEach((section) => {
        if (section.dataset.section === showSectionData) {
          section.style.display = "block";
        } else {
          section.style.display = "none";
        }
      });
    }

    links.forEach((link) => {
      link.addEventListener("click", function (e) {
        e.preventDefault();
        toggleSections(this.dataset.toggle);
      });
    });

    toggleSections("index");
  }
}

class NavbarBurger {
  constructor() {
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
  constructor() {
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
  new ContentSwapper();
  new NavbarBurger();
  new DropdownChevron();
});
