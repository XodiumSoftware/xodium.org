class Utils {
  private targets: NodeListOf<HTMLElement> =
    document.querySelectorAll("[data-cs-target]");
  private currentTarget: string = "";

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
    document.body.addEventListener(
      "click",
      (e) => {
        this.handleClick(e);
        this.handleNavbarClick(e);
      },
      { capture: true }
    );
  }

  handleClick(e: MouseEvent): void {
    const targetId = (e.target as Element).getAttribute("data-ila-target");
    const behavior =
      (e.target as Element).getAttribute("data-ila-behavior") || "smooth";
    if (targetId) {
      e.preventDefault();
      const targetEl = document.getElementById(targetId);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: behavior as ScrollBehavior });
      } else {
        console.error(`Element with ID ${targetId} not found`);
      }
    }
  }

  handleNavbarClick(e: MouseEvent): void {
    const el = (e.target as HTMLElement).closest(".navbar-burger");
    if (el && el instanceof HTMLElement && !el.dataset.initialized) {
      const target = document.getElementById(el.dataset.target!);
      if (target) {
        el.classList.toggle("is-active");
        target.classList.toggle("is-active");
        el.dataset.initialized = "true";
      } else {
        console.error(`Target element with ID ${el.dataset.target} not found`);
      }
    }
  }

  handleDropdownHover(): void {
    const toolsDropdown = document.querySelector(
      ".navbar-item.has-dropdown"
    ) as HTMLElement;
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
        console.error("toolsDropdown element not found");
      }
      if (!chevronIcon) {
        console.error("chevronIcon element not found");
      }
    }
  }

  handleContentSwap(): void {
    this.targets = document.querySelectorAll("[data-cs-target]");
    this.currentTarget = sessionStorage.getItem("currentTarget") || "index";

    document.body.addEventListener("click", (e) => {
      const trigger = (e.target as HTMLElement).closest("[data-cs-trigger]");
      if (trigger && trigger instanceof HTMLElement) {
        e.preventDefault();
        this.toggleSections(trigger.dataset.csTrigger!);
      }
    });
    this.toggleSections(this.currentTarget);
  }

  toggleSections(showTargetData: string): void {
    this.targets.forEach((target: HTMLElement) => {
      target.style.display =
        target.getAttribute("data-cs-target") === showTargetData ? "" : "none";
    });
    sessionStorage.setItem("currentTarget", showTargetData);
    window.scrollTo(0, 0);
  }

  toggleClass(el: HTMLElement, oldClass: string, newClass: string): void {
    el.classList.replace(oldClass, newClass);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new Utils();
});
