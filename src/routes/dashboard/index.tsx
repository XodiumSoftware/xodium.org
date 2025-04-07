/*
 * Copyright (c) 2025. Xodium.
 * All rights reserved.
 */

import {Handlers, PageProps} from "$fresh/server.ts";
import {Head} from "$fresh/runtime.ts";
import {State} from "../../middlewares/auth.ts";
import Footer from "../../components/footer.tsx";
import Grid from "../../components/grid.tsx";

export const handler: Handlers<null, State> = {
  GET(_req, ctx) {
    return ctx.render();
  },
};

export default function Dashboard({ state }: PageProps<null, State>) {
  const user = state.user;

  return (
    <>
      <Head>
        <title>Xodium | Dashboard</title>
      </Head>
      <Grid />
      <div class="min-h-screen flex flex-col bg-slate-100 dark:bg-slate-900">
        <main class="flex-grow container mx-auto px-4 py-8">
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div class="flex items-center gap-4 mb-6">
              {user?.avatar_url && (
                <img
                  src={user.avatar_url}
                  alt="Profile"
                  class="w-12 h-12 rounded-full"
                />
              )}
              <div>
                <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
                  Welcome, {user?.name}!
                </h1>
                <p class="text-gray-600 dark:text-gray-300">
                  {user?.email}
                </p>
              </div>
            </div>

            <div class="mt-6">
              <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Dashboard Content
              </h2>
              <p class="text-gray-700 dark:text-gray-300">
                This is your protected dashboard. Only authenticated users can
                see this page.
              </p>
            </div>

            <div class="mt-8">
              <a
                href="/api/auth/signout"
                class="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Sign Out
              </a>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}
