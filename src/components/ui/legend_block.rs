use leptos::prelude::*;

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
        kbd: "Alt + t",
        desc: "Team",
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
/// Each row pairs a small input cell (mouse action or key cap) with the
/// action it performs on the 3D block. Styled like the title block cells to
/// read as drafting annotations.
#[component]
#[must_use]
pub fn LegendBlock() -> impl IntoView {
    view! {
        <div class="legend-block font-mono" role="list" aria-label="Interactions">
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
    }
}
