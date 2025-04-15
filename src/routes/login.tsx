/*
 * Copyright (c) 2025. Xodium.
 * All rights reserved.
 */

import {Head} from "$fresh/runtime.ts";
import {VNode} from "preact";
import Footer from "../components/footer.tsx";
import Grid from "../components/grid.tsx";

/**
 * Login component
 * @returns {VNode} VNode
 */
export default function Login(): VNode {
  return (
    <>
      <Head>
        <title>Xodium | Dashboard Login</title>
      </Head>
      <section class="flex flex-col h-screen">
        <main class="flex-grow grid place-items-center bg-slate-100 dark:bg-slate-900 px-6 py-24 sm:py-32 lg:px-8">
          <Grid />
          <div class="flex flex-col items-center gap-4 z-10">
            <a
              href="/"
              class="flex items-center text-2xl font-semibold text-gray-900 dark:text-white"
            >
              <img
                class="w-8 h-8 mr-2"
                src="/favicon.svg"
                alt="Xodium Icon"
              />
              Xodium
            </a>
            <div class="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
              <div class="p-6 space-y-4 md:space-y-6 sm:p-8">
                <h1 class="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
                  Sign in to your account
                </h1>
                <div class="space-y-4 md:space-y-6">
                  <p class="text-sm text-gray-700 dark:text-gray-300">
                    To access Xodium's dashboard, please sign in with your
                    GitHub account.
                  </p>
                  <a
                      href="/auth/sign-in"
                    class="relative inline-flex items-center justify-center w-full p-0.5 overflow-hidden text-sm text-black rounded-lg group bg-gradient-to-br from-[#CB2D3E] to-[#EF473A] group-hover:from-[#CB2D3E] group-hover:to-[#EF473A] hover:text-white dark:text-white font-semibold"
                  >
                    <span class="relative w-full flex items-center justify-center px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-800 rounded-md group-hover:bg-opacity-0">
                      <svg
                        class="w-5 h-5 mr-2"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fill-rule="evenodd"
                          d="M10 .333A9.911 9.911 0 0 0 6.866 19.65c.5.092.678-.215.678-.477 0-.237-.01-1.017-.014-1.845-2.757.6-3.338-1.169-3.338-1.169a2.627 2.627 0 0 0-1.1-1.451c-.9-.615.07-.6.07-.6a2.084 2.084 0 0 1 1.518 1.021 2.11 2.11 0 0 0 2.884.823c.044-.503.268-.973.63-1.325-2.2-.25-4.516-1.1-4.516-4.9A3.832 3.832 0 0 1 4.7 7.068a3.56 3.56 0 0 1 .095-2.623s.832-.266 2.726 1.016a9.409 9.409 0 0 1 4.962 0c1.89-1.282 2.717-1.016 2.717-1.016.366.83.402 1.768.1 2.623a3.827 3.827 0 0 1 1.02 2.659c0 3.807-2.319 4.644-4.525 4.889a2.366 2.366 0 0 1 .673 1.834c0 1.326-.012 2.394-.012 2.72 0 .263.18.572.681.475A9.911 9.911 0 0 0 10 .333Z"
                          clip-rule="evenodd"
                        />
                      </svg>
                      Sign in with GitHub
                    </span>
                  </a>
                  <p class="text-xs text-center text-gray-500 dark:text-gray-400">
                    By signing in, you agree to our&nbsp;
                    <a
                      href="https://github.com/XodiumSoftware"
                      class="text-gray-500 hover:underline dark:text-white"
                    >
                      Terms of Service
                    </a>
                    &nbsp;and&nbsp;
                    <a
                      href="https://github.com/XodiumSoftware"
                      class="text-gray-500 hover:underline dark:text-white"
                    >
                      Privacy Policy
                    </a>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </section>
    </>
  );
}
