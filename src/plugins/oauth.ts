/*
 * Copyright (c) 2025. Xodium.
 * All rights reserved.
 */

import {createGitHubOAuthConfig, createHelpers} from "@deno/kv-oauth";
import {Plugin} from "$fresh/server.ts";

export const { signIn, handleCallback, signOut, getSessionId } = createHelpers(
  createGitHubOAuthConfig(),
);

export default {
  name: "oauth",
  routes: [
    {
      path: "/sign-in",
      handler: async (req) => await signIn(req),
    },
    {
      path: "/callback",
      handler: async (req) => (await handleCallback(req)).response,
    },
    {
      path: "/sign-out",
      handler: async (req) => await signOut(req),
    },
  ],
} as Plugin;
