use crate::components::*;
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
            <section id="landing" class="relative isolate px-6 py-[8dvh] sm:py-[10dvh] lg:px-8">
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

                <div class="mx-auto max-w-2xl py-[6dvh] sm:py-[8dvh] lg:py-[10dvh]">
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
                        <div class="flex-shrink-0 flex items-center bg-[#d0d0d0] p-2 relative">
                            <CornerFrame style="square" black=true class="h-full w-full flex items-center justify-center">
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
            <TeamDeckSection />
            </main>

            <Footer />
        </div>
    }
}
