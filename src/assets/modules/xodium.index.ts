// xodium.index.ts
import "xodium/typewriter";
import { Utils, CLICK_EVENT, FOCUS_OUT_EVENT } from "xodium/utils";

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
    eventTypes: ["scroll"],
    method: () => Utils.handleElementVisibility(".visibility", 100),
  },
]);
Utils.populateTeamCards();
