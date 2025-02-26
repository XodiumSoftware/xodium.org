/**
 * Copyright (c) 2025. Xodium.
 * All rights reserved.
 */

import { Head } from "$fresh/runtime.ts";
import Footer from "../components/footer.tsx";

/**
 * Error404 route
 */
export default function Error404() {
  return (
    <>
      <Head>
        <title>Xodium | 404</title>
      </Head>
      <div class="flex flex-col h-screen">
        <main class="flex-grow grid place-items-center bg-slate-100 dark:bg-slate-900 px-6 py-24 sm:py-32 lg:px-8">
          <div class="absolute inset-0 h-full w-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:96px_96px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_60%,transparent_100%)] pointer-events-none">
          </div>
          <div class="text-center">
            <p class="text-base font-semibold text-[#CB2D3E] dark:text-[#CB2D3E]">
              Xodium | 404
            </p>
            <h1 class="mt-4 text-3xl font-bold tracking-tight text-black dark:text-white sm:text-5xl">
              Page not found
            </h1>
            <p class="mt-6 text-base leading-7 text-slate-600 dark:text-slate-400">
              Sorry, we couldn’t find the page you’re looking for.
            </p>
            <div class="mt-10 flex items-center justify-center gap-x-6">
              <a
                href="/"
                class="relative inline-flex items-center justify-center p-0.5 overflow-hidden text-sm text-slate-900 rounded-lg group bg-gradient-to-br from-[#CB2D3E] to-[#EF473A] group-hover:from-[#CB2D3E] group-hover:to-[#EF473A] hover:text-white dark:text-white font-semibold"
              >
                <span class="relative px-5 py-2.5 transition-all ease-in duration-75 bg-slate-100 dark:bg-slate-900 rounded-md group-hover:bg-opacity-0">
                  Go back home
                </span>
              </a>
              <a href="mailto:info@xodium.org">
                <button
                  type="button"
                  class="text-sm font-semibold leading-6 text-black dark:text-white hover:text-[#CB2D3E]"
                >
                  Contact support&nbsp;
                  <span aria-hidden="true">→</span>
                </button>
              </a>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}
