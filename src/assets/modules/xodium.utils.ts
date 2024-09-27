// xodium.utils.ts
class Utils {
  constructor() {
    document.addEventListener("click", (e) =>
      this.handleToggle(e, "data-toggle")
    );
  }

  handleToggle = (e: Event, attr: string) =>
    (e.target as HTMLElement).getAttribute(attr) &&
    document
      .getElementById((e.target as HTMLElement).getAttribute(attr)!)
      ?.classList.toggle("hidden");
}

new Utils();
