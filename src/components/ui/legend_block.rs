use leptos::prelude::*;

struct LegendEntry {
    label: &'static str,
    color: &'static str,
}

const LEGEND_ENTRIES: &[LegendEntry] = &[
    LegendEntry {
        label: "Placeholder 1",
        color: "var(--color-primary)",
    },
    LegendEntry {
        label: "Placeholder 2",
        color: "var(--color-secondary)",
    },
    LegendEntry {
        label: "Placeholder 3",
        color: "var(--color-accent)",
    },
    LegendEntry {
        label: "Placeholder 4",
        color: "var(--color-info)",
    },
    LegendEntry {
        label: "Placeholder 5",
        color: "var(--color-success)",
    },
    LegendEntry {
        label: "Placeholder 6",
        color: "var(--color-warning)",
    },
    LegendEntry {
        label: "Placeholder 7",
        color: "var(--color-error)",
    },
    LegendEntry {
        label: "Placeholder 8",
        color: "var(--color-neutral)",
    },
    LegendEntry {
        label: "Placeholder 9",
        color: "var(--color-primary)",
    },
    LegendEntry {
        label: "Placeholder 10",
        color: "var(--color-secondary)",
    },
];

#[component]
#[must_use]
pub fn LegendBlock() -> impl IntoView {
    view! {
        <dl class="legend-block font-mono" aria-label="Legend">
            {LEGEND_ENTRIES
                .iter()
                .map(|entry| view! {
                    <div class="legend-row">
                        <dt>
                            <span
                                class="legend-swatch"
                                style=format!("background-color: {};", entry.color)
                            />
                        </dt>
                        <dd>"= "{entry.label}</dd>
                    </div>
                })
                .collect::<Vec<_>>()}
        </dl>
    }
}
