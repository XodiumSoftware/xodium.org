/**
 * Copyright (c) 2025. Xodium.
 * All rights reserved.
 */

import { Handlers } from "$fresh/server.ts";

const CLIENT_ID = Deno.env.get("GITHUB_CLIENT_ID") || "";
const CLIENT_SECRET = Deno.env.get("GITHUB_CLIENT_SECRET") || "";
const REDIRECT_URI = Deno.env.get("REDIRECT_URI") ||
  "http://localhost:8000/api/auth/github/callback";

export const handler: Handlers = {
  async GET(req) {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");

    if (!code) {
      const authUrl = new URL("https://github.com/login/oauth/authorize");
      authUrl.searchParams.set("client_id", CLIENT_ID);
      authUrl.searchParams.set("redirect_uri", REDIRECT_URI);
      authUrl.searchParams.set("scope", "user:email read:user");

      return new Response(null, {
        status: 302,
        headers: {
          Location: authUrl.toString(),
        },
      });
    }

    try {
      const tokenResponse = await fetch(
        "https://github.com/login/oauth/access_token",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            code,
            redirect_uri: REDIRECT_URI,
          }),
        },
      );

      const tokenData = await tokenResponse.json();
      const accessToken = tokenData.access_token;

      if (!accessToken) {
        throw new Error("Failed to get access token");
      }

      const userResponse = await fetch("https://api.github.com/user", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const _userData = await userResponse.json();

      // Create a session for the user
      // This would typically involve setting cookies and storing session data
      // For now, we'll just redirect to the dashboard with user data in query params

      const dashboardUrl = new URL("/dashboard", req.url);

      const cookie =
        `auth_token=${accessToken}; Path=/; HttpOnly; SameSite=Strict; Max-Age=86400`;

      return new Response(null, {
        status: 302,
        headers: {
          Location: dashboardUrl.toString(),
          "Set-Cookie": cookie,
        },
      });
    } catch (error) {
      console.error("Authentication error:", error);
      return new Response(JSON.stringify({ error: "Authentication failed" }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }
  },
};
