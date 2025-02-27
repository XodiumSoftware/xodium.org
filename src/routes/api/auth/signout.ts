/**
 * Copyright (c) 2025. Xodium.
 * All rights reserved.
 */

import { Handlers } from "$fresh/server.ts";

export const handler: Handlers = {
  GET(_req) {
    const expiredCookie =
      "auth_token=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0";
    return new Response(null, {
      status: 302,
      headers: {
        Location: "/",
        "Set-Cookie": expiredCookie,
      },
    });
  },
};
