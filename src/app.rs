use leptos::prelude::*;
use xodiumweb::components::Footer;

#[component]
pub fn App() -> impl IntoView {
    view! {
        <div>
            <Header />

            // Landing section
            <section id="landing" class="relative isolate px-6 pt-14 lg:px-8 pb-24 sm:pb-32">
                <Grid />

                <div
                    class="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
                    aria-hidden="true"
                >
                    <div class="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary to-secondary opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem] clip-organic-blob"></div>
                </div>

                <div class="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
                    <div class="text-center">
                        <h1 class="text-4xl font-bold tracking-tight text-base-content sm:text-6xl">
                            // TODO: Typewriter
                            "CODING "
                            <span class="bg-gradient-to-r from-primary to-secondary inline-block text-transparent bg-clip-text">
                                "TODO: Typewriter component"
                            </span>
                        </h1>
                        <p class="mt-6 text-lg leading-8 text-base-content/70">
                            "Open-Source " <strong class="text-primary">(CAD)</strong>
                            "Software Company"
                        </p>
                        <div class="mt-10 flex items-center justify-center gap-x-6">
                            <a
                                href="https://github.com/XodiumSoftware"
                                class="btn btn-primary hover:btn-warning"
                            >
                                "Get started"
                            </a>
                            <a href="https://wiki.xodium.org" class="hover:text-primary">
                                "Documentation →"
                            </a>
                        </div>
                    </div>
                </div>

                <div
                    class="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-50rem)]"
                    aria-hidden="true"
                >
                    <div class="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-primary to-secondary opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem] clip-organic-blob"></div>
                </div>
            </section>

            // Projects section
            <section id="projects" class="pb-24 sm:pb-32 px-6">
                <div class="mx-auto max-w-7xl">
                    <div class="max-w-2xl mx-auto text-center mb-12">
                        <h2 class="text-3xl font-bold tracking-tight text-base-content sm:text-4xl">
                            "Our Projects"
                        </h2>
                        <p class="mt-6 text-lg leading-8 text-base-content/70">
                            "Explore our open-source projects and contributions."
                        </p>
                    </div>
                    // TODO: ProjectGrid
                    <div>"TODO: ProjectGrid component"</div>
                </div>
            </section>

            // Team section
            <section id="team" class="pb-24 sm:pb-32">
                <div class="mx-auto grid max-w-7xl gap-x-8 gap-y-20 px-6 lg:px-8 xl:grid-cols-3">
                    <div class="max-w-2xl">
                        <h2 class="text-3xl font-bold tracking-tight text-base-content sm:text-4xl">
                            "Meet our team"
                        </h2>
                        <p class="mt-6 text-lg leading-8 text-base-content/70">
                            "No matter the project, our team can handle it."
                        </p>
                    </div>
                    // TODO: TeamGrid
                    <div>"TODO: TeamGrid component"</div>
                </div>
            </section>

            <Footer />
        </div>
    }
}
