/*
 * Copyright (c) 2025. Xodium.
 * All rights reserved.
 */

import {createGitHubOAuthConfig, createHelpers} from "@deno/kv-oauth";
import {Plugin} from "$fresh/server.ts";
import {KvStore} from "../utils/constants.ts";

interface SessionData {
  accessToken: string;
}

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
      handler: async (req) => {
        const { response, sessionId, tokens } = await handleCallback(req);
        const accessToken = tokens.accessToken;
        if (sessionId && accessToken) {
          const sessionKey: Deno.KvKey = ["site_sessions", sessionId];
          const dataToStore: SessionData = { accessToken: accessToken };
          try {
            await KvStore.setItem<SessionData>(sessionKey, dataToStore);
            console.log(
              `Manually stored access token for session: ${sessionId}`,
            );
          } catch (error) {
            console.error(
              `Failed to manually store access token for session ${sessionId}:`,
              error,
            );
          }
        } else {
          console.error(
            "Callback handler: Missing sessionId or accessToken, cannot save manually.",
          );
        }
        return response;
      },
    },
    {
      path: "/sign-out",
      handler: async (req) => await signOut(req),
    },
  ],
} as Plugin;
