/*
 * Copyright (c) 2025. Xodium.
 * All rights reserved.
 */

import {createGitHubOAuthConfig, createHelpers} from "@deno/kv-oauth";
import type {Plugin} from "$fresh/server.ts";

const {signIn, handleCallback, signOut, getSessionId} = createHelpers(
    createGitHubOAuthConfig(),
);

export default {
  name: "oauth",
  routes: [
    {
      path: "/auth/sign-in",
      async handler(req) {
        return await signIn(req);
      },
    },
    {
      path: "/auth/callback",
      async handler(req) {
        return await handleCallback(req);
      },
    },
    {
      path: "/auth/sign-out",
      async handler(req) {
        return await signOut(req);
      },
    },
    {
      path: "/protected",
      async handler(req) {
        return await getSessionId(req) === undefined
            ? new Response("Unauthorized", {
              status: 302,
              headers: {"Location": "/login"},
            })
            : new Response(null, {status: 204});
      },
    },
  ],
} as Plugin;
