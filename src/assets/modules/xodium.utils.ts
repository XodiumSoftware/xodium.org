// xodium.utils.ts
import { GithubService } from "xodium/utils/github";

export const CLICK_EVENT: string = "click";
export const FOCUS_OUT_EVENT: string = "focusout";

/**
 * Utility class providing various helper methods.
 *
 * @class
 * @classdesc This class contains static methods for adding event listeners, handling toggle and scroll events,
 * toggling arrow direction, and populating a team grid with member data fetched from a GitHub service.
 */
export class Utils {
  /**
   * Adds event listeners for specified event types and methods.
   *
   * This method attaches event listeners for the provided event types and methods to the document.
   *
   * @static
   * @method
   * @param {Array<{ eventType: string[], method: (e: Event) => void }>} eventList - List of event types and corresponding methods.
   * @returns {void}
   */
  static eventListenerManager(
    eventList: Array<{ eventTypes: string[]; method: (e: Event) => void }>
  ): void {
    eventList.forEach(({ eventTypes, method }) => {
      eventTypes.forEach((eventType) => {
        document.addEventListener(eventType, method);
      });
    });
  }

  /**
   * Handles the toggle functionality for a given event.
   *
   * @param e - The event object.
   * @param attr - The attribute to get from the event target.
   * @param classtype - The class type to toggle on the target element.
   *
   * The function performs the following actions based on the event type:
   * - For a click event, it toggles the specified class on the target element and updates the arrow state.
   * - For a focus out event, it ensures the specified class is added to the target element and updates the arrow state.
   */
  static handleToggle = (e: Event, attr: string, classtype: string) => {
    const target = (e.target as HTMLElement).getAttribute(attr);
    if (target) {
      e.preventDefault();
      const el = document.getElementById(target);
      if (e.type === CLICK_EVENT) {
        const isOpen = !el?.classList.contains(classtype);
        el?.classList.toggle(classtype);
        Utils.toggleArrow({ isOpen });
      } else if (
        e.type === FOCUS_OUT_EVENT &&
        !el?.classList.contains(classtype)
      ) {
        if (!el?.contains((e as FocusEvent).relatedTarget as Node)) {
          el?.classList.add(classtype);
          Utils.toggleArrow({ isOpen: true });
        }
      }
    }
  };

  /**
   * Handles the scroll event by preventing the default behavior and scrolling to the target element.
   *
   * @param e - The scroll event.
   * @param attr - The attribute name to retrieve the target element's ID.
   * @param behavior - The scroll behavior (e.g., 'auto' or 'smooth').
   */
  static handleScroll = (e: Event, attr: string, behavior: ScrollBehavior) => {
    const target = (e.target as HTMLElement).getAttribute(attr);
    if (target) {
      e.preventDefault();
      document.getElementById(target)?.scrollIntoView({ behavior });
    }
  };

  /**
   * Toggles the direction of an arrow element based on the provided state.
   *
   * @param {Object} param - The parameter object.
   * @param {boolean} param.isOpen - The state indicating whether the arrow should point down (true) or up (false).
   * @returns {void}
   */
  static toggleArrow = ({ isOpen }: { isOpen: boolean }): void => {
    const arrow = document.querySelector(".arrow") as HTMLElement;
    if (arrow) {
      arrow.style.transform = isOpen ? "rotate(0deg)" : "rotate(180deg)";
    }
  };

  /**
   * Populates the team grid with member data fetched from the GitHub service.
   *
   * This function retrieves member information from the GitHub service and dynamically
   * creates and appends list items to the team grid in the DOM. Each list item contains
   * member details such as their avatar, login name, and role.
   *
   * @returns {Promise<void>} A promise that resolves when the team grid has been populated.
   *
   * @throws Will log an error to the console if there is an issue fetching the team members.
   */
  static async populateTeamGrid(): Promise<void> {
    try {
      const members = await GithubService.getData("members");
      const grid = document.querySelector(".team-grid");
      if (grid && Array.isArray(members)) {
        const fragment = document.createDocumentFragment();
        members.forEach((member) => {
          const card = document.createElement("li");
          card.innerHTML = `
            <div class="flex items-center gap-x-6 mb-4">
              <a href="${member.html_url}" target="_blank">
                <img
                  class="h-16 w-16 rounded-full"
                  src="${member.avatar_url}"
                  alt="${member.login} picture"
                />
              </a>
              <div>
                <h3 class="text-base font-semibold leading-7 tracking-tight text-gray-900 dark:text-slate-100">
                  ${member.login}
                </h3>
                <p class="text-sm font-semibold leading-6 text-[#CB2D3E]">
                  {MEMBER ROLE FEATURE WIP}
                </p>
              </div>
            </div>
          `;
          fragment.appendChild(card);
        });
        grid.appendChild(fragment);
      }
    } catch (error) {
      console.error("Error fetching team members:", error);
    }
  }
}
