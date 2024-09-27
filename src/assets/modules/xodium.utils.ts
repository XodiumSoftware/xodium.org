// xodium.utils.ts

class Utils {
  clickEvent = "click";
  focusoutEvent = "focusout";

  constructor() {
    [this.clickEvent, this.focusoutEvent].forEach((eType) =>
      document.addEventListener(eType, (e) => {
        this.handleToggle(e, "data-toggle", "hidden");
      })
    );
    document.addEventListener(this.clickEvent, (e) => {
      this.handleScroll(e, "data-scroll", "smooth");
    });
  }

  handleToggle = (e: Event, attr: string, classtype: string) => {
    const target = (e.target as HTMLElement).getAttribute(attr);
    if (target) {
      e.preventDefault();
      const element = document.getElementById(target);
      if (e.type === this.clickEvent) {
        const isOpen = !element?.classList.contains(classtype);
        element?.classList.toggle(classtype);
        this.toggleArrow(isOpen);
      } else if (e.type === this.focusoutEvent) {
        element?.classList.add(classtype);
        this.toggleArrow(false);
      }
    }
  };

  handleScroll = (e: Event, attr: string, behavior: ScrollBehavior) => {
    const target = (e.target as HTMLElement).getAttribute(attr);
    if (target) {
      e.preventDefault();
      document.getElementById(target)?.scrollIntoView({ behavior });
    }
  };

  toggleArrow = (isOpen: boolean) => {
    const arrow = document.getElementById("arrow");
    if (arrow) {
      arrow.textContent = isOpen ? "▲" : "▼";
    }
  };
}

new Utils();
