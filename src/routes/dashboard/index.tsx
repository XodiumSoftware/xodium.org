/*
 * Copyright (c) 2025. Xodium.
 * All rights reserved.
 */

import {Head} from "$fresh/runtime.ts";
import Footer from "../../components/footer.tsx";
import Grid from "../../components/grid.tsx";

export default function Dashboard() {
  return (
    <>
      <Head>
        <title>Xodium | Dashboard</title>
      </Head>
      <Grid />
      <div class="min-h-screen flex flex-col bg-slate-100 dark:bg-slate-900">
        <main class="flex-grow container mx-auto px-4 py-8">
        </main>
        <Footer />
      </div>
    </>
  );
}
