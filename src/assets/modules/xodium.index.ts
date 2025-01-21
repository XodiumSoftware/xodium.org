/*
 * Copyright (c) 2025. Xodium.
 * All rights reserved.
 */

import "xodium/typewriter";
import {Utils} from "xodium/utils";
import {CLICK_EVENT, FOCUS_OUT_EVENT} from "xodium/constants";

Utils.eventListenerManager([
  {
    eventTypes: [CLICK_EVENT, FOCUS_OUT_EVENT],
    method: (e) => Utils.handleToggle(e, "data-toggle", "hidden"),
  },
  {
    eventTypes: ["scroll"],
    method: () => Utils.handleElementVisibility("visibility", 100),
  },
]);
Utils.replaceContents([
  { source: "xCAD", target: ".xCAD-version" },
  { source: "xLIB", target: ".xLIB-version" },
]).then((_) => {});
