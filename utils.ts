import {createDefine} from "fresh";

export interface State {
  shared: string;
}

export const SECOND = 1000;
export const MINUTE = SECOND * 60;
export const HOUR = MINUTE * 60;
export const define = createDefine<State>();
export const CONFIG = {version: "3.0.6"};
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
