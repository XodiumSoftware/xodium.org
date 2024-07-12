// illyrion.utils.ts

class Utils {
  private targets: NodeListOf<Element>;
  private currentTarget: string;

  constructor() {
    this.handleClick = this.handleClick.bind(this);
    this.handleNavbarClick = this.handleNavbarClick.bind(this);
    this.handleDropdownHover = this.handleDropdownHover.bind(this);
    this.handleContentSwap = this.handleContentSwap.bind(this);

    this.attachEventListeners();
    this.handleDropdownHover();
    this.handleContentSwap();
  }

  attachEventListeners(): void {
    const addEl = document.body.addEventListener;
    addEl("click", this.handleClick, { capture: true });
    addEl("click", this.handleNavbarClick, { capture: true });
  }

  handleClick(e: MouseEvent): void {
    const targetId = (e.target as Element).getAttribute("data-ila-target");
    const behavior =
      (e.target as Element).getAttribute("data-ila-behavior") || "smooth";
    if (targetId) {
      e.preventDefault();
      const targetEl = document.getElementById(targetId);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: behavior });
      } else {
        throw new Error(targetId + " element not found");
      }
    }
  }

  handleNavbarClick(e: MouseEvent): void {
    const el = (e.target as Element).closest(".navbar-burger");
    if (el && !el.dataset.initialized) {
      const target = document.getElementById(el.dataset.target!);
      el.classList.toggle("is-active");
      target!.classList.toggle("is-active");
      el.dataset.initialized = "true";
    }
  }

  handleDropdownHover(): void {
    const toolsDropdown = document.querySelector(".navbar-item.has-dropdown");
    const chevronIcon = document.getElementById("tools-chevron");

    if (toolsDropdown && chevronIcon) {
      if (!toolsDropdown.dataset.initialized) {
        toolsDropdown.addEventListener("mouseover", () => {
          this.toggleClass(chevronIcon, "fa-chevron-down", "fa-chevron-up");
        });

        toolsDropdown.addEventListener("mouseout", () => {
          this.toggleClass(chevronIcon, "fa-chevron-up", "fa-chevron-down");
        });

        toolsDropdown.dataset.initialized = "true";
      }
    } else {
      if (!toolsDropdown) {
        throw new Error("toolsDropdown element not found");
      }
      if (!chevronIcon) {
        throw new Error("chevronIcon element not found");
      }
    }
  }

  handleContentSwap(): void {
    this.targets = document.querySelectorAll("[data-cs-target]");
    this.currentTarget = sessionStorage.getItem("currentTarget") || "index";

    document.body.addEventListener("click", (e) => {
      const trigger = (e.target as Element).closest("[data-cs-trigger]");
      if (trigger) {
        e.preventDefault();
        this.toggleSections(trigger.dataset.csTrigger!);
      }
    });

    this.toggleSections(this.currentTarget);
  }

  toggleSections(showTargetData: string): void {
    this.targets.forEach((target) => {
      target.style.display =
        target.getAttribute("data-cs-target") === showTargetData ? "" : "none";
    });
    sessionStorage.setItem("currentTarget", showTargetData);
  }

  toggleClass(el: HTMLElement, oldClass: string, newClass: string): void {
    el.classList.replace(oldClass, newClass);
  }
}

document.addEventListener("DOMContentLoaded", function () {
  new Utils();
});
