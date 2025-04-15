/*
 * Copyright (c) 2025. Xodium.
 * All rights reserved.
 */

import {Head} from "$fresh/runtime.ts";
import Footer from "../components/footer.tsx";
import Grid from "../components/grid.tsx";

export default function Dashboard() {
  const handleSignOut = async () => {
    await fetch("/auth/sign-out");
    globalThis.location.href = "/";
  };

  return (
    <>
      <Head>
        <title>Xodium | Dashboard</title>
      </Head>
      <Grid />
      <div class="min-h-screen flex flex-col bg-slate-100 dark:bg-slate-900">
        <main class="flex-grow container mx-auto px-4 py-8">
          <button
            type="button"
            onClick={handleSignOut}
            class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          >
            Sign Out
          </button>
        </main>
        <Footer />
      </div>
    </>
  );
}
