/*
 * Copyright (c) 2025. Xodium.
 * All rights reserved.
 */

import "xodium/typewriter";
import {CLICK_EVENT, FOCUS_OUT_EVENT, Utils} from "xodium/utils";

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
Utils.populateTeamCards().then((r) => console.log(r));
