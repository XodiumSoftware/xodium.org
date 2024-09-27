// xodium.utils.ts
class Utils {
  constructor() {
    ["click", "focusout"].forEach((eType) =>
      document.addEventListener(eType, (e) =>
        this.handleToggle(e, "data-toggle")
      )
    );
  }

  handleToggle = (e: Event, attr: string) => {
    const target = (e.target as HTMLElement).getAttribute(attr);
    if (target) {
      const element = document.getElementById(target);
      if (e.type === "click") {
        element?.classList.toggle("hidden");
      } else if (e.type === "focusout") {
        element?.classList.add("hidden");
      }
    }
  };
}

new Utils();
