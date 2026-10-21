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
        kbd: "DRAG",
        desc: "Pan view",
    },
    LegendEntry {
        kbd: "WHEEL",
        desc: "Zoom in / out",
    },
    LegendEntry {
        kbd: "2× MMB",
        desc: "Reset view",
    },
    LegendEntry {
        kbd: "CLICK",
        desc: "Pin block",
    },
    LegendEntry {
        kbd: "SPACE",
        desc: "Pin block (kbd)",
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
