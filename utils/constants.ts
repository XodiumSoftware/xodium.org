/*
 * Copyright (c) 2025. Xodium.
 * All rights reserved.
 */

export const config = { version: "2.0.0" };
export const FETCH_DATA_MAP: Record<
  string,
  { url: string; config?: RequestInit }
> = {
  members: {
    url: "https://api.github.com/orgs/XodiumSoftware/public_members",
    config: { headers: { Accept: "application/vnd.github+json" } },
  },
};
