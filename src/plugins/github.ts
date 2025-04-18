/*
 * Copyright (c) 2025. Xodium.
 * All rights reserved.
 */

import {Plugin} from "$fresh/server.ts";
import {createOrgDataHandler, createUserDataHandler} from "../utils/utils.ts";

export interface Member {
  login: string;
  avatar_url: string;
  html_url: string;
}

export interface Repo {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string;
}

export interface GitHubUserProfile {
  login: string;
  id: number;
  avatar_url: string;
  html_url: string;
  name: string | null;
}

export default {
  name: "github",
  routes: [
    {
      path: "/api/github/org/members",
      handler: createOrgDataHandler<Member[]>(
        "members",
        "/orgs/{org}/members",
      ),
    },
    {
      path: "/api/github/org/repos",
      handler: createOrgDataHandler<Repo[]>(
        "repos",
        "/orgs/{org}/repos",
      ),
    },
    {
      path: "/api/github/user/profile",
      handler: createUserDataHandler<GitHubUserProfile>(
        "user",
        "/user",
      ),
    },
  ],
} as Plugin;
