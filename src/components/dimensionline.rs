use leptos::prelude::*;

#[derive(Clone)]
pub struct DimensionLineProperties {
    pub label: String,
    pub length: Option<u32>,
}

/// A decorative dimension line component that mimics CAD measurement annotations.
/// Displays as `║─── 120mm ───║` with arrow endpoints.
#[component]
pub fn DimensionLine(props: DimensionLineProperties) -> impl IntoView {
    let length = props.length.unwrap_or(120);
    let dash_count = (length / 10).max(3).min(20) as usize;

    view! {
        <div class="flex items-center justify-center gap-1 text-base-content/40 font-mono text-xs tracking-wider select-none" aria-hidden="true">
            // Left arrow
            <span class="text-lg leading-none">"║"</span>

            // Left dashes
            <span class="flex items-center">
                {std::iter::repeat("─").take(dash_count).collect::<String>()}
            </span>

            // Measurement label
            <span class="px-2 whitespace-nowrap">{props.label}</span>

            // Right dashes
            <span class="flex items-center">
                {std::iter::repeat("─").take(dash_count).collect::<String>()}
            </span>

            // Right arrow
            <span class="text-lg leading-none">"║"</span>
        </div>
    }
}
