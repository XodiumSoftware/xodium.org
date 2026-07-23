use crate::components::{
    Footer, Header, LandingSection, LineDraw, ProjectsSection, TeamDeckSection,
};
use leptos::prelude::*;

#[component]
#[must_use]
pub fn App() -> impl IntoView {
    view! {
        <div>
            <a
                href="#main-content"
                class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-content focus:rounded"
            >
                "Skip to main content"
            </a>
            <div class="relative">
                <Header />

                <div class="absolute inset-x-0 top-0 h-128 bg-gradient-to-b from-base-100 to-transparent pointer-events-none z-10" />

                <LandingSection />
            </div>

        <main id="main-content" tabindex="-1">

        // Line divider between hero and projects
        <LineDraw />

        // Projects section
        <ProjectsSection />

        // Line draw divider
        <LineDraw />

        // Team section
        <TeamDeckSection />
        </main>

        <Footer />
    </div>
    }
}
