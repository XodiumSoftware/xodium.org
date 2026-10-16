use leptos::prelude::*;

struct LegendEntry {
    icon: &'static str,
    action: &'static str,
}

const LEGEND_ENTRIES: &[LegendEntry] = &[
    LegendEntry {
        icon: "DRAG",
        action: "Pan view",
    },
    LegendEntry {
        icon: "WHEEL",
        action: "Zoom in / out",
    },
    LegendEntry {
        icon: "2× MMB",
        action: "Reset view",
    },
    LegendEntry {
        icon: "CLICK",
        action: "Pin block",
    },
    LegendEntry {
        icon: "SPACE",
        action: "Pin block (kbd)",
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
                        <span class="legend-swatch">{entry.icon}</span>
                        <span class="legend-label">{entry.action}</span>
                    </div>
                })
                .collect::<Vec<_>>()}
        </div>
    }
}
