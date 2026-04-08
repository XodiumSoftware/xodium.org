use crate::blueprintgrid::BlueprintGrid;
use crate::footer::Footer;
use crate::header::Header;
use crate::hexgrid::HexPattern;
use crate::linedraw::{LineDraw, LineDrawHero};
use crate::parallax::ParallaxLanding;
use crate::projectgrid::ProjectGrid;
use crate::sectionfade::FadeOverlay;
use crate::codeblock::CodeBlock;
use crate::teambg::TeamBackground;
use crate::teamgrid::TeamGrid;
use crate::wireframes::WireframeShapes;
use leptos::prelude::*;

#[component]
pub fn App() -> impl IntoView {
    view! {
        <div>
            <a
                href="#main-content"
                class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-content focus:rounded"
            >
                "Skip to main content"
            </a>
            <Header />

            <main id="main-content">
            // Landing section
            <section id="landing" class="relative isolate px-6 pt-14 lg:px-8 pb-24 sm:pb-32">
                <BlueprintGrid />
                <WireframeShapes />
                <LineDrawHero />
                <ParallaxLanding />

                <div
                    class="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
                    aria-hidden="true"
                >
                    <div class="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary to-secondary opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem] clip-organic-blob"></div>
                </div>

                <div class="mx-auto max-w-2xl py-24 sm:py-32 lg:py-40">
                    <CodeBlock />
                </div>

                <div
                    class="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-50rem)]"
                    aria-hidden="true"
                >
                    <div class="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-primary to-secondary opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem] clip-organic-blob"></div>
                </div>
            </section>

            // Line divider between hero and projects
            <LineDraw />

            // Projects section
            <section id="projects" class="relative pb-24 sm:pb-32 px-6">
                <HexPattern />
                <FadeOverlay />
                <div class="mx-auto max-w-7xl relative z-10">
                    <div class="max-w-2xl mx-auto text-center mb-12">
                        <h2 class="text-3xl font-bold tracking-tight text-base-content sm:text-4xl">
                            "Our Projects"
                        </h2>
                        <p class="mt-6 text-lg leading-8 text-base-content/70">
                            "Explore our open-source projects and contributions."
                        </p>
                    </div>
                    <ProjectGrid />
                </div>
            </section>

            // Line draw divider
            <LineDraw />

            // Team section
            <section id="team" class="relative pb-24 sm:pb-32">
                <TeamBackground />
                <FadeOverlay />
                <div class="relative z-10 mx-auto grid max-w-7xl gap-x-8 xl:gap-y-20 px-6 lg:px-8 xl:grid-cols-3">
                    <div class="max-w-2xl mx-auto xl:mx-0 text-center xl:text-left mb-12 xl:mb-0">
                        <h2 class="text-3xl font-bold tracking-tight text-base-content sm:text-4xl">
                            "Meet our team"
                        </h2>
                        <p class="mt-6 text-lg leading-8 text-base-content/70">
                            "No matter the project," <br /> "our team can handle it."
                        </p>
                    </div>
                    <TeamGrid />
                </div>
            </section>
            </main>

            <Footer />
        </div>
    }
}
