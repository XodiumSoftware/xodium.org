/*
 * Copyright (c) 2025. Xodium.
 * All rights reserved.
 */

import {Head} from "$fresh/runtime.ts";
import {STATUS_CODE} from "$std/http/status.ts";
import {getSessionId} from "../plugins/oauth.ts";
import DashboardPage from "../islands/dashboard.tsx";

export default async function DashboardRoute(req: Request) {
  const sessionId = await getSessionId(req);
  const isAuthenticated = sessionId !== undefined;
  if (!isAuthenticated) {
    return Response.redirect(new URL("/login", req.url), STATUS_CODE.Found);
  }

  return (
    <>
      <Head>
        <title>Xodium | Dashboard</title>
      </Head>
      <DashboardPage />
    </>
  );
}
