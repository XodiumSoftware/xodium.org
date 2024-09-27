// xodium.utils.ts

class Utils {
  clickEvent = "click";
  focusoutEvent = "focusout";

  constructor() {
    [this.clickEvent, this.focusoutEvent].forEach((eType) =>
      document.addEventListener(eType, (e) => {
        e.preventDefault();
        this.handleToggle(e, "data-toggle", "hidden");
      })
    );
    document.addEventListener(this.clickEvent, (e) => {
      e.preventDefault();
      this.handleScroll(e, "data-scroll", "smooth");
    });
  }

  handleToggle = (e: Event, attr: string, classtype: string) => {
    const target = (e.target as HTMLElement).getAttribute(attr);
    if (target) {
      const element = document.getElementById(target);
      if (e.type === this.clickEvent) {
        element?.classList.toggle(classtype);
      } else if (e.type === this.focusoutEvent) {
        element?.classList.add(classtype);
      }
    }
  };

  handleScroll = (e: Event, attr: string, behavior: ScrollBehavior) => {
    document
      .getElementById((e.target as HTMLElement).getAttribute(attr)!)
      ?.scrollIntoView({ behavior });
  };
}

new Utils();
