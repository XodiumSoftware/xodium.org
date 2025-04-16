/*
 * Copyright (c) 2025. Xodium.
 * All rights reserved.
 */

import Footer from "../components/footer.tsx";
import Header from "../components/header.tsx";
import Typewriter from "../islands/typewriter.tsx";
import Grid from "../components/grid.tsx";
import TeamCards from "../islands/teamcards.tsx";
import Carousel from "../islands/carousel.tsx";

export default function Home() {
  return (
    <div>
      <Header />
      {/* Landing section */}
      <section
        id="landing"
        className="relative isolate px-6 pt-14 lg:px-8 pb-24 sm:pb-32"
      >
        <Grid />
        <div
          className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
          aria-hidden="true"
        >
          <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#CB2D3E] to-[#EF473A] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem] clip-organic-blob">
          </div>
        </div>
        <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-black dark:text-white sm:text-6xl">
              CODING&nbsp;
              <span className="bg-gradient-to-r from-[#CB2D3E] to-[#EF473A] inline-block text-transparent bg-clip-text">
                <Typewriter
                  text={["MODULAR", "STRUCTURED", "EFFICIENT"]}
                  speed={0.15}
                  loop
                  pause={[1, 0]}
                  unwrite
                />
              </span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-slate-400">
              Open-Source&nbsp;<strong className="text-[#CB2D3E]">
                (CAD)&nbsp;
              </strong>Software Company
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <a
                className="relative inline-flex items-center justify-center p-0.5 overflow-hidden text-sm text-black rounded-lg group bg-gradient-to-br from-[#CB2D3E] to-[#EF473A] group-hover:from-[#CB2D3E] group-hover:to-[#EF473A] hover:text-white dark:text-white font-semibold"
                href="/dashboard"
              >
                <button
                  type="button"
                  className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-slate-100 dark:bg-gray-900 rounded-md group-hover:bg-opacity-0"
                >
                  Get started
                </button>
              </a>
              <a href="https://wiki.xodium.org">
                <button
                  type="button"
                  className="text-sm font-semibold leading-6 text-black dark:text-white hover:text-[#CB2D3E]"
                >
                  Documentation&nbsp;
                  <span aria-hidden="true">→</span>
                </button>
              </a>
            </div>
          </div>
        </div>
        <div
          className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-50rem)]"
          aria-hidden="true"
        >
          <div className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#CB2D3E] to-[#EF473A] opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem] clip-organic-blob">
          </div>
        </div>
      </section>

      {/* Projects section */}
      <section
        id="projects"
        className="bg-slate-100 dark:bg-slate-900 pb-24 sm:pb-32"
      >
        <Carousel
          images={[
            "https://placehold.co/800x400",
            "https://placehold.co/800x400",
            "https://placehold.co/800x400",
          ]}
        />
      </section>

      {/* Team section */}
      <section
        id="team"
        className="bg-slate-100 dark:bg-slate-900 pb-24 sm:pb-32"
      >
        <div className="mx-auto grid max-w-7xl gap-x-8 gap-y-20 px-6 lg:px-8 xl:grid-cols-3">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold tracking-tight text-black dark:text-white sm:text-4xl">
              Meet our team
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-slate-400">
              No matter the project, our team can handle it.
            </p>
          </div>
          <TeamCards />
        </div>
      </section>
      <Footer />
    </div>
  );
}
