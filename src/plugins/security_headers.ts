/*
 * Copyright (c) 2025. Xodium.
 * All rights reserved.
 */

import type {Plugin} from "$fresh/server.ts";

export default {
  name: "security-headers",
  middlewares: [
    {
      path: "/",
      middleware: {
        handler: async (req, ctx) => {
          if (
            ctx.destination !== "route" ||
            new URL(req.url).pathname.startsWith("/api")
          ) return await ctx.next();

          const initResponse = await ctx.next();
          const response = new Response(initResponse.body, {
            status: initResponse.status,
            statusText: initResponse.statusText,
            headers: new Headers(initResponse.headers),
          });
          response.headers.set(
            "Strict-Transport-Security",
            "max-age=63072000;",
          );
          response.headers.set(
            "Referrer-Policy",
            "strict-origin-when-cross-origin",
          );
          response.headers.set("X-Content-Type-Options", "nosniff");
          response.headers.set("X-Frame-Options", "SAMEORIGIN");
          response.headers.set("X-XSS-Protection", "1; mode=block");
          response.headers.set(
            "Content-Security-Policy",
              "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: avatars.githubusercontent.com; font-src 'self';",
          );
          return response;
        },
      },
    },
  ],
} as Plugin;
