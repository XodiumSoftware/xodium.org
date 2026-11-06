//! Main projects band, directly below the header.
//!
//! Two equal-width panels separated by a vertical rule, each showing a main
//! project as a title row, a description row, and a pair of action buttons.

use leptos::prelude::*;

/// A single main project panel in the [`MainProjects`] band.
#[derive(Clone)]
#[must_use]
pub struct MainProject {
    /// Tailwind background utility standing in for the project mark.
    pub mark: &'static str,
    /// Project name, rendered as an `h2`.
    pub title: &'static str,
    /// Year the project was established.
    pub established: &'static str,
    /// Short project description.
    pub description: &'static str,
    /// Label of the left action button.
    pub left_button: &'static str,
    /// Destination of the left action button.
    pub left_href: &'static str,
    /// Label of the right action button.
    pub right_button: &'static str,
    /// Destination of the right action button.
    pub right_href: &'static str,
}

/// Panels rendered by [`MainProjects`], in reading order.
///
/// Placeholder copy, marks and links until the real projects exist.
const MAIN_PROJECTS: &[MainProject] = &[
    MainProject {
        mark: "bg-primary",
        title: "Cadiotheka",
        established: "Est 2026",
        description: "The open hub for CAD creators.",
        left_button: "Visit",
        left_href: "https://cadiotheka.com/",
        right_button: "Learn More",
        right_href: "https://github.com/XodiumSoftware/cadiotheka",
    },
    MainProject {
        mark: "bg-secondary",
        title: "Project 2",
        established: "Est 2026",
        description: "Placeholder description for the second main project.",
        left_button: "Visit",
        left_href: "#",
        right_button: "Learn More",
        right_href: "#",
    },
];

/// Main projects region below the header.
///
/// Each panel is a 2x2 grid: a full-height icon in the left column spanning
/// both rows, and the text stacked in the right column — title with
/// establishment year, then description, then the two action buttons. The
/// panels stack on narrow viewports, with the first on top.
#[component]
#[must_use]
pub fn MainProjects() -> impl IntoView {
    view! {
        <section
            class="sheet-band sheet-band-mainprojects grid grid-cols-1 md:grid-cols-2 md:divide-x md:divide-base-content/40 border-b border-base-content/40"
            aria-label="Main projects"
        >
            {MAIN_PROJECTS
                .iter()
                .map(|project| {
                    view! {
                        <article class="grid grid-cols-[9.0625rem_minmax(0,1fr)]">
                            <span class=format!("w-[9.0625rem] h-[9.0625rem] {}", project.mark)></span>
                            <div class="col-start-2 row-start-1 flex min-w-0 flex-col justify-center gap-2 p-4">
                                <div class="flex min-w-0 items-center gap-3">
                                    <h2 class="text-sm font-semibold uppercase tracking-[0.08em]">
                                        {project.title}
                                    </h2>
                                    <span class="ml-auto text-xs uppercase tracking-widest opacity-50">
                                        {project.established}
                                    </span>
                                </div>
                                <p class="text-xs leading-relaxed text-base-content/70">
                                    {project.description}
                                </p>
                                <div class="flex min-w-0 items-center gap-3 mt-3">
                                    <a
                                        class=format!(
                                            "kbd kbd-lg keycap-btn flex-1 {}",
                                            project.mark,
                                        )
                                        href=project.left_href
                                    >
                                        {project.left_button}
                                    </a>
                                    <a class="kbd kbd-lg keycap-btn flex-1" href=project.right_href>
                                        {project.right_button}
                                    </a>
                                </div>
                            </div>
                        </article>
                    }
                })
                .collect_view()}
        </section>
    }
}
