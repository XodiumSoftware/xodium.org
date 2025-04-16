/*
 * Copyright (c) 2025. Xodium.
 * All rights reserved.
 */

import {Head} from "$fresh/runtime.ts";
import {Handlers, STATUS_CODE} from "$fresh/server.ts";
import Footer from "../components/footer.tsx";
import Grid from "../components/grid.tsx";
import {getSessionId} from "../plugins/oauth.ts";
import GithubIcon from "../components/icons/github.tsx";

export const handler: Handlers = {
  async GET(req, ctx) {
    const sessionId = await getSessionId(req);
    return sessionId
      ? new Response(null, {
        status: STATUS_CODE.SeeOther,
        headers: { location: "/dashboard" },
      })
      : ctx.render();
  },
};

export default function Login() {
  return (
    <>
      <Head>
        <title>Xodium | Dashboard Login</title>
      </Head>
      <section className="flex flex-col h-screen">
        <main className="flex-grow grid place-items-center bg-slate-100 dark:bg-slate-900 px-6 py-24 sm:py-32 lg:px-8">
          <Grid />
          <div className="flex flex-col items-center gap-4 z-10">
            <a
              href="/src/static"
              className="flex items-center text-2xl font-semibold text-gray-900 dark:text-white"
            >
              <img
                className="w-8 h-8 mr-2"
                src="/favicon.svg"
                alt="Xodium Icon"
              />
              Xodium
            </a>
            <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
              <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white text-center">
                  Sign in to your account
                </h1>
                <div className="space-y-4 md:space-y-6">
                  <p className="text-sm text-gray-700 dark:text-gray-300 text-center">
                    To access Xodium's dashboard, please sign in with your
                    GitHub account.
                  </p>
                  <a
                    href="/sign-in"
                    className="relative inline-flex items-center justify-center w-full p-0.5 overflow-hidden text-sm text-black rounded-lg group bg-gradient-to-br from-[#CB2D3E] to-[#EF473A] group-hover:from-[#CB2D3E] group-hover:to-[#EF473A] hover:text-white dark:text-white font-semibold"
                  >
                    <span className="relative w-full flex items-center justify-center px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-800 rounded-md group-hover:bg-opacity-0">
                      <GithubIcon className="w-5 h-5 mr-2" />
                      Sign in with GitHub
                    </span>
                  </a>
                  <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                    By signing in, you agree to our&nbsp;
                    <a
                      href="https://github.com/XodiumSoftware"
                      className="text-gray-500 hover:underline dark:text-white"
                    >
                      Terms of Service
                    </a>
                    &nbsp;and&nbsp;
                    <a
                      href="https://github.com/XodiumSoftware"
                      className="text-gray-500 hover:underline dark:text-white"
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
