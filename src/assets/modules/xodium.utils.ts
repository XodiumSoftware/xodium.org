// xodium.utils.ts
import { GithubService } from "xodium/utils/github";

const CLICK_EVENT: string = "click";
const FOCUS_OUT_EVENT: string = "focusout";

class Utils {
  constructor() {
    [CLICK_EVENT, FOCUS_OUT_EVENT].forEach((eType) =>
      document.addEventListener(eType, (e) => {
        this.handleToggle(e, "data-toggle", "hidden");
      })
    );
    document.addEventListener(CLICK_EVENT, (e) => {
      this.handleScroll(e, "data-scroll", "smooth");
    });
    this.populateTeamGrid();
  }

  handleToggle = (e: Event, attr: string, classtype: string) => {
    const target = (e.target as HTMLElement).getAttribute(attr);
    if (target) {
      e.preventDefault();
      const element = document.getElementById(target);
      if (e.type === CLICK_EVENT) {
        const isOpen = !element?.classList.contains(classtype);
        element?.classList.toggle(classtype);
        this.toggleArrow(isOpen);
      } else if (
        e.type === FOCUS_OUT_EVENT &&
        !element?.classList.contains(classtype)
      ) {
        element?.classList.add(classtype);
        this.toggleArrow(true);
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
      arrow.textContent = isOpen ? "▼" : "▲";
    }
  };

  async populateTeamGrid(): Promise<void> {
    const members = await GithubService.StoreOrgMembers();
    const grid = document.querySelector(".team-grid");
    if (grid) {
      if (Array.isArray(members)) {
        members.forEach((member) => {
          const card = document.createElement("li");
          card.classList.add("mb-4");
          card.innerHTML = `
              <div class="flex items-center gap-x-6">
                <a href="${member.html_url}" target="_blank">
                  <img
                    class="h-16 w-16 rounded-full"
                    src="${member.avatar_url}"
                    alt="${member.login} picture"
                  />
                </a>
                <div>
                  <h3
                    class="text-base font-semibold leading-7 tracking-tight text-gray-900 dark:text-slate-100"
                  >
                    ${member.login}
                  </h3>
                  <p class="text-sm font-semibold leading-6 text-indigo-600">
                    ${member.role}
                  </p>
                </div>
              </div>
            `;
          grid.appendChild(card);
        });
      } else {
        console.error("Expected members to be an array, but got:", members);
      }
    } else {
      console.error('Element with class ".team-grid" not found');
    }
  }
}

new Utils();
