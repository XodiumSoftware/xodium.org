/*
 * Copyright (c) 2025. Xodium.
 * All rights reserved.
 */

import { hoursToMilliseconds } from "./utils.ts";

export const CONFIG = { version: "2.0.9" };

export const GITHUB = {
  api: {
    url: "https://api.github.com",
    version: "2022-11-28",
    members: {
      cacheExpiry: hoursToMilliseconds(1),
    },
  },
  org: {
    name: "XodiumSoftware",
    user_agent: "XodiumSoftware/xodium.org",
  },
};
