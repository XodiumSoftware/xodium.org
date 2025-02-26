/*
 * Copyright (c) 2025. Xodium.
 * All rights reserved.
 */

import { IConfig } from "axiod/interfaces";

// UTILS GITHUB CONSTANTS
export const FETCH_DATA_MAP: Record<string, { url: string; config?: IConfig }> =
  {
    members: {
      url: "https://api.github.com/orgs/XodiumSoftware/public_members",
      config: { headers: { Accept: "application/vnd.github+json" } },
    },
  };
