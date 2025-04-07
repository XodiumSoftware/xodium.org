/*
 * Copyright (c) 2025. Xodium.
 * All rights reserved.
 */

// DO NOT EDIT. This file is generated by Fresh.
// This file SHOULD be checked into source version control.
// This file is automatically updated during development when running `dev.ts`.

import * as $_404 from "./routes/_404.tsx";
import * as $_app from "./routes/_app.tsx";
import * as $api_auth_github from "./routes/api/auth/github.ts";
import * as $api_auth_github_callback from "./routes/api/auth/github/callback.ts";
import * as $api_auth_signout from "./routes/api/auth/signout.ts";
import * as $api_orgs_github_members from "./routes/api/orgs/github/members.ts";
import * as $api_orgs_github_repos from "./routes/api/orgs/github/repos.ts";
import * as $dashboard_index from "./routes/dashboard/index.tsx";
import * as $index from "./routes/index.tsx";
import * as $login from "./routes/login.tsx";
import * as $carousel from "./islands/carousel.tsx";
import * as $teamcards from "./islands/teamcards.tsx";
import * as $typewriter from "./islands/typewriter.tsx";
import type {Manifest} from "$fresh/server.ts";

const manifest = {
  routes: {
    "./routes/_404.tsx": $_404,
    "./routes/_app.tsx": $_app,
    "./routes/api/auth/github.ts": $api_auth_github,
    "./routes/api/auth/github/callback.ts": $api_auth_github_callback,
    "./routes/api/auth/signout.ts": $api_auth_signout,
    "./routes/api/orgs/github/members.ts": $api_orgs_github_members,
    "./routes/api/orgs/github/repos.ts": $api_orgs_github_repos,
    "./routes/dashboard/index.tsx": $dashboard_index,
    "./routes/index.tsx": $index,
    "./routes/login.tsx": $login,
  },
  islands: {
    "./islands/carousel.tsx": $carousel,
    "./islands/teamcards.tsx": $teamcards,
    "./islands/typewriter.tsx": $typewriter,
  },
  baseUrl: import.meta.url,
} satisfies Manifest;

export default manifest;
