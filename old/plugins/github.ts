import {App} from "fresh";
import {createOrgDataHandler} from "../lib/github.ts";
import {State} from "../utils.ts";

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

/**
 * GitHub Plugin
 * @param app - Fresh App instance
 */
export default function githubPlugin(app: App<State>) {
  app.get(
    "/api/github/org/members",
    createOrgDataHandler<Member[]>(
      "members",
      "/orgs/{org}/members",
    ),
  );

  app.get(
    "/api/github/org/repos",
    createOrgDataHandler<Repo[]>(
      "repos",
      "/orgs/{org}/repos",
    ),
  );
}
