use leptos::prelude::*;

use crate::components::ui::team_avatars::TeamAvatars;

/// An entry in the drawing viewport's interaction legend.
struct LegendEntry {
    /// The mouse action or keyboard input displayed to the user.
    kbd: &'static str,
    /// A short description of the action performed by the input.
    desc: &'static str,
}

const LEGEND_ENTRIES: &[LegendEntry] = &[
    LegendEntry {
        kbd: "Alt + 1",
        desc: "Cadiotheka",
    },
    LegendEntry {
        kbd: "Alt + g",
        desc: "GitHub",
    },
    LegendEntry {
        kbd: "Alt + c",
        desc: "Buy Me a Coffee",
    },
];

/// Interaction legend for the drawing viewport.
///
/// The legend is split into two columns: the left lists keyboard shortcuts,
/// the right shows the GitHub team as a DaisyUI avatar group.
#[component]
#[must_use]
pub fn LegendBlock() -> impl IntoView {
    view! {
        <div class="legend-block font-mono" role="group" aria-label="Interactions and team">
            <div class="legend-column" role="list" aria-label="Interactions">
                {LEGEND_ENTRIES
                    .iter()
                    .map(|entry| view! {
                        <div class="legend-row" role="listitem">
                            <kbd class="kbd kbd-sm">{entry.kbd}</kbd>
                            <span class="legend-label">{entry.desc}</span>
                        </div>
                    })
                    .collect::<Vec<_>>()}
            </div>
            <div class="legend-team" aria-label="Team">
                <TeamAvatars />
            </div>
        </div>
    }
}
