// illyrion.utils.mjs

class ContentSwapper {
  constructor() {
    const links = document.querySelectorAll("[data-toggle]");
    const sections = document.querySelectorAll("[data-section]");

    function toggleSections(showSectionData) {
      sections.forEach((section) => {
        if (section.dataset.section === showSectionData) {
          section.style.display = "";
        } else {
          section.style.display = "none";
        }
      });
      sessionStorage.setItem("currentSection", showSectionData);
    }

    links.forEach((link) => {
      link.addEventListener("click", function (e) {
        e.preventDefault();
        toggleSections(this.dataset.toggle);
      });
    });

    const currentSection = sessionStorage.getItem("currentSection");
    toggleSections(currentSection || "index");
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

class SmoothScroller {
  constructor() {
    const scrollLink = document.getElementById("scrollLink");

    if (scrollLink) {
      scrollLink.addEventListener("click", function (event) {
        event.preventDefault();
        document
          .getElementById("dardanium")
          .scrollIntoView({ behavior: "smooth" });
      });
    } else {
      console.error("scrollLink element not found");
    }
  }
}

document.addEventListener("DOMContentLoaded", function () {
  new ContentSwapper();
  new NavbarBurger();
  new DropdownChevron();
  new SmoothScroller();
});
