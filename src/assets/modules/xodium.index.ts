// xodium.index.ts
import "xodium/typewriter";
import { Utils } from "xodium/utils";
import { CLICK_EVENT, FOCUS_OUT_EVENT } from "xodium/constants";
import { GithubService } from "xodium/utils/github";

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
// Utils.populateTeamCards();
Utils.replaceContents([
  { source: "xCAD", target: ".xCAD-version" },
  { source: "xLIB", target: ".xLIB-version" },
]);

export function getMembers(): Promise<unknown[]> {
  return GithubService.getData("members");
}
