use crate::blueprintgrid::BlueprintGrid;
use crate::codeblock::CodeBlock;
use crate::cornerframe::CornerFrame;
use crate::footer::Footer;
use crate::header::Header;
use crate::hexgrid::HexPattern;
use crate::linedraw::{LineDraw, LineDrawHero};
use crate::parallax::ParallaxLanding;
use crate::projectgrid::ProjectGrid;
use crate::sectionfade::FadeOverlay;
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
            <section id="landing" class="relative isolate px-6 py-24 sm:py-32 lg:px-8">
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
            <section id="projects" class="relative py-24 sm:py-32 px-6">
                <HexPattern />
                <FadeOverlay />
                <div class="mx-auto max-w-7xl relative z-10">
                    <div class="flex gap-8 items-stretch">
                        <div class="flex-shrink-0 flex items-center bg-[#d0d0d0] p-4 relative">
                            <CornerFrame style="square" black=true>
                                <h2 class="text-3xl font-bold tracking-tight text-transparent bg-base-100 bg-clip-text sm:text-4xl [writing-mode:vertical-rl] rotate-180 whitespace-nowrap">
                                    "PROJECTS"
                                </h2>
                            </CornerFrame>
                        </div>
                        <div class="flex-1 min-w-0">
                            <ProjectGrid />
                        </div>
                    </div>
                </div>
            </section>

            // Line draw divider
            <LineDraw />

            // Team section
            <section id="team" class="relative py-24 sm:py-32">
                <TeamBackground />
                <FadeOverlay />
                <div class="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
                    <div class="team-deck-container">
                        // Title card - front
                        <div class="team-card team-card-title p-2">
                            <CornerFrame style="square" black=true class="h-full w-full flex items-center justify-center">
                                <h2 class="text-2xl font-bold tracking-tight text-transparent bg-base-100 bg-clip-text whitespace-nowrap">
                                    "THE TEAM"
                                </h2>
                            </CornerFrame>
                        </div>
                        // Team cards stack behind
                        <TeamGrid />
                    </div>
                </div>
            </section>
            </main>

            <Footer />
        </div>
    }
}
