import {define} from "../utils.ts";
import TeamGrid from "../islands/teamgrid.tsx";
import Footer from "../components/footer.tsx";
import Grid from "../components/grid.tsx";
import Header from "../components/header.tsx";
import ProjectGrid from "../islands/projectgrid.tsx";
import Typewriter from "../islands/typewriter.tsx"; // noinspection JSUnusedGlobalSymbols

// noinspection JSUnusedGlobalSymbols
export default define.page(() => (
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
        <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary to-secondary opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem] clip-organic-blob">
        </div>
      </div>
      <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-base-content sm:text-6xl">
            CODING&nbsp;{""}
            <span className="bg-gradient-to-r from-primary to-secondary inline-block text-transparent bg-clip-text">
              <Typewriter
                text={["MODULAR", "STRUCTURED", "EFFICIENT"]}
                speed={0.15}
                loop
                pause={[1, 0]}
                unwrite
              />
            </span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-base-content/70">
            Open-Source&nbsp;{""}
            <strong className="text-primary">
              (CAD)&nbsp;{""}
            </strong>Software Company
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <a
              className="btn btn-primary"
              href="https://github.com/XodiumSoftware"
            >
              Get started
            </a>
            <a href="https://wiki.xodium.org">
              <button
                type="button"
                className="btn btn-ghost hover:text-primary"
              >
                Documentation&nbsp;{""}
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
        <div className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-primary to-secondary opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem] clip-organic-blob">
        </div>
      </div>
    </section>

    {/*Projects section*/}
    <section
      id="projects"
      className="pb-24 sm:pb-32 px-6"
    >
      <div className="mx-auto max-w-7xl">
        <div className="max-w-2xl mx-auto text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-base-content sm:text-4xl">
            Our Projects
          </h2>
          <p className="mt-6 text-lg leading-8 text-base-content/70">
            Explore our open-source projects and contributions.
          </p>
        </div>
        <div>
          <ProjectGrid />
        </div>
      </div>
    </section>

    {/* Team section */}
    <section
      id="team"
      className="pb-24 sm:pb-32"
    >
      <div className="mx-auto grid max-w-7xl gap-x-8 gap-y-20 px-6 lg:px-8 xl:grid-cols-3">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-bold tracking-tight text-base-content sm:text-4xl">
            Meet our team
          </h2>
          <p className="mt-6 text-lg leading-8 text-base-content/70">
            No matter the project, our team can handle it.
          </p>
        </div>
        <TeamGrid />
      </div>
    </section>
    <Footer />
  </div>
));
