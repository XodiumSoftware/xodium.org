/*
 * Copyright (c) 2025. Xodium.
 * All rights reserved.
 */

import {Handlers} from "$fresh/server.ts";

export const handler: Handlers = {
  GET(req) {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");

    if (!code) {
      return new Response(
        JSON.stringify({ error: "No authorization code received" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    const redirectUrl = new URL("/api/auth/github", req.url);
    redirectUrl.searchParams.set("code", code);

    return new Response(null, {
      status: 302,
      headers: {
        Location: redirectUrl.toString(),
      },
    });
  },
};
