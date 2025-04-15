/*
 * Copyright (c) 2025. Xodium.
 * All rights reserved.
 */

import {createGitHubOAuthConfig, createHelpers} from "@deno/kv-oauth";
import {Plugin, STATUS_CODE} from "$fresh/server.ts";

const { signIn, handleCallback, signOut, getSessionId } = createHelpers(
  createGitHubOAuthConfig(),
);

export default {
  name: "oauth",
  routes: [
    {
      path: "/auth/sign-in",
      handler: async (req) => await signIn(req),
    },
    {
      path: "/auth/callback",
      handler: async (req) => await handleCallback(req),
    },
    {
      path: "/auth/sign-out",
      handler: async (req) => await signOut(req),
    },
    {
      path: "/protected",
      handler: async (req) => {
        await getSessionId(req) === undefined
          ? new Response("Unauthorized", {
            status: STATUS_CODE.OK,
            headers: { "Location": "/login" },
          })
          : new Response("Authorized", { status: STATUS_CODE.OK });
      },
    },
  ],
} as Plugin;
