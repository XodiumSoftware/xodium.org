/**
 * Copyright (c) 2025. Xodium.
 * All rights reserved.
 */

import { MiddlewareHandler } from "$fresh/server.ts";

export interface User {
  id: number;
  login: string;
  name: string;
  avatar_url: string;
  email: string;
}

export interface State {
  user?: User;
  isAuthenticated: boolean;
}

function parseCookies(cookieHeader: string | null): Record<string, string> {
  if (!cookieHeader) return {};

  return cookieHeader.split(";")
    .map((cookie) => cookie.trim().split("="))
    .reduce((acc, [key, value]) => {
      acc[key] = value;
      return acc;
    }, {} as Record<string, string>);
}

export const authMiddleware: MiddlewareHandler<State> = async (req, ctx) => {
  const state: State = {
    isAuthenticated: false,
  };

  const cookies = parseCookies(req.headers.get("cookie"));
  const authToken = cookies["auth_token"];

  if (authToken) {
    try {
      const userResponse = await fetch("https://api.github.com/user", {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (userResponse.ok) {
        const userData = await userResponse.json();

        // Get email if not provided
        let email = userData.email;
        if (!email) {
          const emailsResponse = await fetch(
            "https://api.github.com/user/emails",
            {
              headers: {
                Authorization: `Bearer ${authToken}`,
              },
            },
          );

          interface GitHubEmail {
            email: string;
            primary: boolean;
            verified: boolean;
            visibility: string | null;
          }

          if (emailsResponse.ok) {
            const emails = await emailsResponse.json() as GitHubEmail[];
            const primaryEmail = emails.find((e: GitHubEmail) => e.primary);
            email = primaryEmail?.email || emails[0]?.email || "";
          }
        }

        state.user = {
          id: userData.id,
          login: userData.login,
          name: userData.name || userData.login,
          avatar_url: userData.avatar_url,
          email: email || "",
        };
        state.isAuthenticated = true;
      }
    } catch (error) {
      console.error("Auth validation error:", error);
    }
  }

  ctx.state = state;

  const url = new URL(req.url);
  const isProtectedRoute = url.pathname.startsWith("/dashboard");

  if (isProtectedRoute && !state.isAuthenticated) {
    return new Response(null, {
      status: 302,
      headers: {
        Location: `/login?redirect=${encodeURIComponent(url.pathname)}`,
      },
    });
  }

  return await ctx.next();
};
