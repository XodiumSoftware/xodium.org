//! Main projects band, directly below the header.
//!
//! Two panels separated by a vertical rule, each showing a main project as a
//! title row, a description row, and a pair of action buttons. The coloured
//! mark doubles as the tab that selects which project the hero shows.

use leptos::prelude::*;

/// A single main project panel in the [`MainProjects`] band.
#[derive(Clone, Debug, PartialEq)]
#[must_use]
pub struct MainProject {
    /// Tailwind utility painting the project mark.
    pub mark: &'static str,
    /// `DaisyUI` button colour for the primary action.
    pub button: &'static str,
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
    /// When true, the action buttons are rendered inert.
    pub disabled: bool,
}

/// Panels rendered by [`MainProjects`], in reading order.
const MAIN_PROJECTS: &[MainProject] = &[
    MainProject {
        mark: "bg-primary tile-grid",
        button: "btn-primary",
        title: "Cadiotheka",
        established: "Est 2026",
        description: "The open hub for CAD creators.",
        left_button: "Visit",
        left_href: "https://cadiotheka.com/",
        right_button: "Learn More",
        right_href: "https://github.com/XodiumSoftware/cadiotheka",
        disabled: false,
    },
    MainProject {
        mark: "hatch",
        button: "btn-secondary",
        title: "Coming Soon",
        established: "Est XXXX",
        description: "Secret project in the making.",
        left_button: "Visit",
        left_href: "#",
        right_button: "Learn More",
        right_href: "#",
        disabled: true,
    },
];

/// The project shown in another band, selected by this band's mark tabs.
///
/// Shared so the hero can react to the same index without either band owning
/// the other's state.
#[derive(Clone, Copy)]
#[must_use]
pub struct SelectedProject(pub RwSignal<usize>);

impl SelectedProject {
    /// Provide the selection signal to the page and return it.
    pub fn provide() -> Self {
        let selected = Self(RwSignal::new(0));
        provide_context(selected);
        selected
    }

    /// Read the signal out of context.
    ///
    /// # Panics
    ///
    /// Panics when [`SelectedProject::provide`] has not run, which means the
    /// page was assembled without the shared selection.
    pub fn use_context() -> Self {
        expect_context::<Self>()
    }
}

/// Returns the project at `index`, or the first project when the index is out
/// of range so a stale selection can never blank the consuming band.
#[must_use]
pub fn project_at(index: usize) -> &'static MainProject {
    MAIN_PROJECTS.get(index).unwrap_or(&MAIN_PROJECTS[0])
}

/// Main projects region below the header.
///
/// Each panel is a two-column grid: the mark, which behaves as a tab, beside
/// the text column carrying the title, description and two action buttons. The
/// panels stack on narrow viewports, with the first on top.
#[component]
#[must_use]
pub fn MainProjects() -> impl IntoView {
    let selected = SelectedProject::use_context();

    view! {
        <section
            class="sheet-band sheet-band-mainprojects grid grid-cols-1 md:grid-cols-2 md:divide-x md:divide-base-content/40 border-b border-base-content/40"
            aria-label="Main projects"
        >
            {MAIN_PROJECTS
                .iter()
                .enumerate()
                .map(|(index, project)| {
                    let is_selected = move || selected.0.get() == index;
                    let panel_id = format!("project-panel-{index}");
                    view! {
                        <article class="grid grid-cols-[8.875rem_minmax(0,1fr)]">
                            <button
                                type="button"
                                class=format!(
                                    "relative overflow-hidden w-[8.875rem] h-[8.875rem] cursor-pointer border border-base-content/30 {}",
                                    project.mark,
                                )
                                role="tab"
                                aria-selected=move || is_selected().to_string()
                                aria-controls=panel_id.clone()
                                aria-label=project.title
                                on:click=move |_| selected.0.set(index)
                            >
                                <span
                                    class="absolute inset-x-6 bottom-0 h-1 rounded-t-full bg-white opacity-0"
                                    class:opacity-100=move || is_selected()
                                    aria-hidden="true"
                                ></span>
                            </button>
                            <div
                                id=panel_id
                                role="tabpanel"
                                class="col-start-2 row-start-1 flex min-w-0 flex-col justify-center gap-2 p-4"
                            >
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
                                            "btn btn-sm flex-1 {}",
                                            if project.disabled {
                                                "btn-disabled"
                                            } else {
                                                project.button
                                            },
                                        )
                                        href=project.left_href
                                        aria-disabled=project.disabled
                                        tabindex=if project.disabled { Some("-1") } else { None }
                                    >
                                        {project.left_button}
                                    </a>
                                    <a
                                        class=format!(
                                            "btn btn-sm flex-1 btn-outline-ghost {}",
                                            if project.disabled { "btn-disabled" } else { "" },
                                        )
                                        href=project.right_href
                                        aria-disabled=project.disabled
                                        tabindex=if project.disabled { Some("-1") } else { None }
                                    >
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
