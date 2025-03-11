/*
 * Copyright (c) 2025. Xodium.
 * All rights reserved.
 */

export const config = { version: "2.0.3" };

export const github = {
  api: {
    url: "https://api.github.com",
    members: {
      cacheExpiry: 60 * 60 * 1000, // 1 hour (in milliseconds)
    },
  },
  org: {
    name: "XodiumSoftware",
  },
};
