/*
 * Copyright (c) 2025. Xodium.
 * All rights reserved.
 */

import {Handlers} from "$fresh/server.ts";
import {getSessionId} from "../../plugins/oauth.ts";
import {getUserData} from "../../utils/utils.ts";
import {KvStore} from "../../utils/constants.ts";
import {GitHubUserProfile} from "../../plugins/github.ts";

interface SessionData {
  accessToken: string;
}

export const handler: Handlers = {
  async GET(req, _ctx) {
    const sessionId = await getSessionId(req);

    if (!sessionId) {
      return Response.json({ isLoggedIn: false, profile: null }, {
        status: 200,
      });
    }

    try {
      const sessionKey = ["site_sessions", sessionId];
      const sessionResult = await KvStore.getItem<SessionData>(sessionKey);

      if (!sessionResult?.accessToken) {
        console.warn(`Access token not found for session ID: ${sessionId}`);
        return Response.json({
          isLoggedIn: false,
          profile: null,
          error: "Invalid session or token missing",
        }, {
          status: 401,
        });
      }

      const accessToken = sessionResult.accessToken;
      const userProfile: GitHubUserProfile = await getUserData(accessToken);

      return Response.json({ isLoggedIn: true, profile: userProfile });
    } catch (error) {
      console.error("API Error: Failed to fetch user profile:", error);
      const errorMessage = error instanceof Error
        ? error.message
        : "Unknown error";
      return Response.json({
        isLoggedIn: false,
        profile: null,
        error: `Server error: ${errorMessage}`,
      }, {
        status: 500,
      });
    }
  },
};
