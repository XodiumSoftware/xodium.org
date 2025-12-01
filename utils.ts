import {createDefine} from "fresh";
import {HOUR} from "https://jsr.io/@fresh/core/2.2.0/src/constants.ts";

export interface State {
  shared: string;
}

export const define = createDefine<State>();

export const CONFIG = { version: "3.0.0" };

export const GITHUB = {
  api: {
    url: "https://api.github.com",
    version: "2022-11-28",
    members: { cacheExpiry: HOUR },
  },
  org: {
    name: "XodiumSoftware",
    user_agent: "XodiumSoftware/xodium.org",
  },
};
