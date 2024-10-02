// xodium.index.ts
import "xodium/typewriter";
import { Utils, CLICK_EVENT, FOCUS_OUT_EVENT } from "xodium/utils";

const SCROLL_EVENT: string = "scroll";

Utils.eventListenerManager([
  {
    eventTypes: [CLICK_EVENT, FOCUS_OUT_EVENT],
    method: (e) => Utils.handleToggle(e, "data-toggle", "hidden"),
  },
  {
    eventTypes: [CLICK_EVENT],
    method: (e) => Utils.handleScroll(e, "data-scroll", "smooth"),
  },
  {
    eventTypes: [SCROLL_EVENT],
    method: () => Utils.handleNavbarVisibility(),
  },
]);
Utils.populateTeamCards();
