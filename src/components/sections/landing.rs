use crate::components::animations::line_draw::LineDrawHero;
use crate::components::ui::code_block::CodeBlock;
use crate::components::ui::effects::blueprint_grid::BlueprintGrid;
use crate::components::ui::effects::parallax::ParallaxLanding;
use crate::components::ui::effects::wire_frames::WireframeShapes;
use leptos::prelude::*;

#[component]
pub fn LandingSection() -> impl IntoView {
    view! {
        <section id="landing" class="hero min-h-[80dvh] relative isolate px-6 lg:px-8">
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

            <div class="hero-content z-10 w-full p-0 justify-center">
                <CodeBlock />
            </div>

            <div
                class="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-50rem)]"
                aria-hidden="true"
            >
                <div class="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-primary to-secondary opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem] clip-organic-blob"></div>
            </div>
        </section>
    }
}
