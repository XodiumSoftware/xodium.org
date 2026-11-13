//! Main projects band, directly below the header.
//!
//! Two panels separated by a vertical rule, each showing a main project as a
//! title row, a description row, and a pair of action buttons. The coloured
//! mark doubles as the tab that selects which project the hero shows.

use crate::components::layout::main::SheetEntrance;
use crate::components::ui::icons::cadiotheka::CadioThekaIcon;
use leptos::prelude::*;

/// A function that renders an icon in a project mark square.
pub type IconRenderer = fn() -> AnyView;

/// A single main project panel in the [`MainProjects`] band.
#[derive(Clone, Debug)]
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
    /// Icon rendered in the project mark square, or [`no_icon`] when empty.
    /// The hero plate reuses it as the project's face.
    pub icon: IconRenderer,
}

/// Renders nothing; used as the default project mark icon.
#[must_use]
pub fn no_icon() -> AnyView {
    view! { <span></span> }.into_any()
}

/// Panels rendered by [`MainProjects`], in reading order.
const MAIN_PROJECTS: &[MainProject] = &[
    MainProject {
        mark: "mark-cadiotheka",
        button: "btn-primary",
        title: "Cadiotheka",
        established: "Est 2026",
        description: "The open hub for CAD creators.",
        left_button: "Visit",
        left_href: "https://cadiotheka.com/",
        right_button: "Learn More",
        right_href: "https://github.com/XodiumSoftware/cadiotheka",
        disabled: false,
        icon: CadioThekaIcon,
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
        icon: no_icon,
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
/// Each panel is a two-column grid: the mark beside the text column carrying the
/// title, description and two action buttons. The panels stack on narrow
/// viewports, with the first on top.
///
/// The mark is a `<button role="tab">` at every width. The hero is on the page
/// at every width too, so the tab always controls something visible and the
/// unselected panel may be announced `aria-selected="false"` honestly. That is
/// why there is no breakpoint branch here: with nothing to hide, the tab
/// relationship holds everywhere, and the markup no longer has to agree with a
/// `max-sm:hidden` on the hero.
///
/// The action pair is styled with utilities. The primary button sweeps its
/// gradient from left to right on hover, which is the one part Tailwind cannot
/// express: the size stays at `bg-size-[200%_100%]` and only its position moves.
///
/// Every colour utility on these buttons is gated on `not-aria-disabled`, which
/// compiles to `:not([aria-disabled="true"])`. Two details make that work, and
/// both are easy to break:
///
/// - The attribute is bound as a string, not a `bool`. Tachys writes a `bool`
///   attribute as presence-only, so `true` produced `aria-disabled=""` and every
///   `:not([aria-disabled="true"])` still matched: the inert buttons stayed
///   coloured.
/// - The gate is `not-aria-disabled`, not `not-disabled`. These are anchors, so
///   `:not(:disabled)` never matches and would gate nothing either way.
///
/// Gating matters because a utility writes a concrete property, unlayered, so it
/// outranks DaisyUI's own `@layer` disabled rules. With the utilities withheld,
/// DaisyUI's greyed fill and faint label are what an inert button shows.
///
/// The outline button's label drops below `btn-sm`'s 0.75rem on phones
/// (`max-sm:[--fontsize:0.5rem]`): the two sit side by side in the panel's text
/// column, which on the narrowest screens is too tight for "Learn More" to keep
/// that size. Only the outline button shrinks, so Visit stays dominant.
#[component]
#[must_use]
pub fn MainProjects() -> impl IntoView {
    let selected = SelectedProject::use_context();
    let entrance = SheetEntrance::use_context();

    view! {
        <section
            class=move || {
                format!(
                    "sheet-band sheet-band-mainprojects {} grid grid-cols-1 md:grid-cols-2 md:divide-x md:divide-base-content/40 border-b border-base-content/40",
                    entrance.band_class(),
                )
            }
            aria-label="Main projects"
        >
            {MAIN_PROJECTS
                .iter()
                .enumerate()
                .map(|(index, project)| {
                    let is_selected = move || selected.0.get() == index;
                    let panel_id = format!("project-panel-{index}");
                    let mark_id = format!("project-mark-{index}");
                    let mark_class = format!(
                        "relative overflow-hidden w-[8.875rem] h-[8.875rem] border border-base-content/30 {} cursor-pointer",
                        project.mark,
                    );

                    view! {
                        <article class="grid grid-cols-[8.875rem_minmax(0,1fr)]">
                            <button
                                type="button"
                                id=mark_id.clone()
                                class=mark_class
                                role="tab"
                                aria-selected=move || is_selected().to_string()
                                aria-controls=panel_id.clone()
                                aria-label=project.title
                                on:click=move |_| selected.0.set(index)
                            >
                                <span
                                    class="absolute inset-0 flex items-center justify-center p-5"
                                    aria-hidden="true"
                                >
                                    {(project.icon)()}
                                </span>
                                <span
                                    class="absolute inset-x-6 bottom-0 h-1 rounded-t-full bg-white opacity-0"
                                    class:opacity-100=move || is_selected()
                                    aria-hidden="true"
                                ></span>
                            </button>
                            <div
                                id=panel_id
                                role="tabpanel"
                                aria-labelledby=mark_id
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
                                {action_pair(project)}
                            </div>
                        </article>
                    }
                })
                .collect_view()}
        </section>
    }
}

/// The Visit / Learn More pair beneath a panel's description.
///
/// Both buttons carry the same colour-utility gate; only the primary one paints
/// a gradient and the outline one stays transparent. See [`MainProjects`] for
/// why the gate is `not-aria-disabled` and why the attribute is a string.
fn action_pair(project: &MainProject) -> impl IntoView {
    view! {
        <div class="flex min-w-0 items-center gap-3 mt-3">
            <a
                class=format!(
                    "btn btn-sm flex-1 not-aria-disabled:border-transparent not-aria-disabled:bg-linear-145 not-aria-disabled:from-[#ff7a18] not-aria-disabled:via-[#ff5500] not-aria-disabled:to-[#ff2a00] not-aria-disabled:bg-size-[200%_100%] not-aria-disabled:bg-position-[0%_0%] transition-[background-position,filter] duration-250 not-aria-disabled:hover:bg-position-[100%_0%] not-aria-disabled:hover:brightness-110 {}",
                    if project.disabled {
                        "btn-disabled"
                    } else {
                        project.button
                    },
                )
                href=project.left_href
                aria-disabled=if project.disabled { "true" } else { "false" }
                tabindex=if project.disabled { Some("-1") } else { None }
            >
                {project.left_button}
            </a>
            <a
                class=format!(
                    "btn btn-sm flex-1 not-aria-disabled:border-base-content not-aria-disabled:bg-transparent not-aria-disabled:text-base-content transition-colors duration-250 not-aria-disabled:hover:border-primary not-aria-disabled:hover:bg-transparent not-aria-disabled:hover:text-primary not-aria-disabled:hover:brightness-110 max-sm:[--fontsize:0.5rem] {}",
                    if project.disabled { "btn-disabled" } else { "" },
                )
                href=project.right_href
                target="_blank"
                rel="noopener noreferrer"
                aria-disabled=if project.disabled { "true" } else { "false" }
                tabindex=if project.disabled { Some("-1") } else { None }
            >
                {project.right_button}
            </a>
        </div>
    }
}
