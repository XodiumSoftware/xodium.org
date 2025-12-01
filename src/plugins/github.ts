import {Plugin} from "$fresh/server.ts";
import {createOrgDataHandler} from "../utils/utils.ts";

export interface Member {
  login: string;
  avatar_url: string;
  html_url: string;
}

export interface Repo {
  id: number;
  name: string;
  description: string;
  html_url: string;
  language: string;
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
  ],
} as Plugin;
