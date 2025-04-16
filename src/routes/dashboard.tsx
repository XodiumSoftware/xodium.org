/*
 * Copyright (c) 2025. Xodium.
 * All rights reserved.
 */

import {Head} from "$fresh/runtime.ts";
import {STATUS_CODE} from "$std/http/status.ts";
import Grid from "../components/grid.tsx";
import {getSessionId} from "../plugins/oauth.ts";
import Footer from "../components/footer.tsx";
import SideBar from "../components/dashboard/sidebar.tsx";

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
      <main className="min-h-screen flex flex-col bg-slate-100 dark:bg-slate-900">
        <div className="flex flex-1">
          <SideBar />
          <div className="flex flex-col flex-1">
            <div className="flex-grow container mx-auto my-8 px-4 py-8 rounded-xl border-r border-gray-200 dark:border-gray-800">
              {/* TODO: Add content */}
            </div>
            <Footer />
          </div>
        </div>
      </main>
    </>
  );
}
