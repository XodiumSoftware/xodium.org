/*
 * Copyright (c) 2025. Xodium.
 * All rights reserved.
 */

import {Head} from "$fresh/runtime.ts";
import {STATUS_CODE} from "$std/http/status.ts";
import Footer from "../components/footer.tsx";
import Grid from "../components/grid.tsx";
import {getSessionId} from "../plugins/oauth.ts";
import SignOutButton from "../islands/signout.tsx";

export default async function Dashboard(req: Request) {
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
      <Grid />
      <div class="min-h-screen flex flex-col bg-slate-100 dark:bg-slate-900">
        <main class="flex-grow container mx-auto px-4 py-8">
          <SignOutButton />
        </main>
        <Footer />
      </div>
    </>
  );
}
