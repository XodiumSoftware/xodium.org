use leptos::prelude::*;

/// Angular section divider - diagonal/angled SVG shape for technical aesthetic
#[component]
pub fn SectionDivider(
    #[prop(default = "")] class: &'static str,
    /// Variant: "angle" (diagonal slash), "zigzag" (technical zigzag), "arrow" (directional)
    #[prop(default = "angle")]
    variant: &'static str,
) -> impl IntoView {
    match variant {
        "zigzag" => view! {
            <div class={format!("relative w-full h-12 overflow-hidden {}", class)}>
                <svg
                    class="absolute inset-0 w-full h-full"
                    viewBox="0 0 1200 48"
                    preserveAspectRatio="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M0,48 L200,0 L400,48 L600,0 L800,48 L1000,0 L1200,48"
                        fill="none"
                        stroke="var(--color-primary)"
                        stroke-width="2"
                        stroke-opacity="0.3"
                    />
                    <path
                        d="M0,48 L200,24 L400,48 L600,24 L800,48 L1000,24 L1200,48"
                        fill="none"
                        stroke="var(--color-secondary)"
                        stroke-width="1"
                        stroke-opacity="0.2"
                    />
                </svg>
                <div class="absolute inset-x-0 top-0 h-6 bg-gradient-to-b from-base-100 to-transparent" />
                <div class="absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-base-100 to-transparent" />
            </div>
        }.into_any(),

        "arrow" => view! {
            <div class={format!("relative w-full h-16 overflow-hidden {}", class)}>
                <svg
                    class="absolute inset-0 w-full h-full"
                    viewBox="0 0 1200 64"
                    preserveAspectRatio="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    // Arrow pointing right
                    <g stroke="var(--color-primary)" stroke-width="2" fill="none" stroke-opacity="0.3">
                        <line x1="100" y1="32" x2="500" y2="32" />
                        <path d="M 450,20 L 500,32 L 450,44" />
                    </g>
                    // Arrow pointing left
                    <g stroke="var(--color-secondary)" stroke-width="2" fill="none" stroke-opacity="0.3">
                        <line x1="700" y1="32" x2="1100" y2="32" />
                        <path d="M 750,20 L 700,32 L 750,44" />
                    </g>
                    // Center marker
                    <circle cx="600" cy="32" r="4" fill="var(--color-primary)" fill-opacity="0.3" />
                </svg>
                <div class="absolute inset-x-0 top-0 h-4 bg-gradient-to-b from-base-100 to-transparent" />
                <div class="absolute inset-x-0 bottom-0 h-4 bg-gradient-to-t from-base-100 to-transparent" />
            </div>
        }.into_any(),

        // Default "angle"
        _ => view! {
            <div class={format!("relative w-full h-20 overflow-hidden {}", class)}>
                <svg
                    class="absolute inset-0 w-full h-full"
                    viewBox="0 0 1200 80"
                    preserveAspectRatio="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    // Main diagonal line
                    <path
                        d="M0,80 L600,0 L1200,80"
                        fill="none"
                        stroke="var(--color-primary)"
                        stroke-width="2"
                        stroke-opacity="0.3"
                    />
                    // Secondary line
                    <path
                        d="M0,80 L600,20 L1200,80"
                        fill="none"
                        stroke="var(--color-secondary)"
                        stroke-width="1"
                        stroke-opacity="0.2"
                    />
                    // Measurement ticks
                    <g stroke="var(--color-primary)" stroke-width="1" stroke-opacity="0.4">
                        <line x1="300" y1="60" x2="300" y2="70" />
                        <line x1="600" y1="30" x2="600" y2="40" />
                        <line x1="900" y1="60" x2="900" y2="70" />
                    </g>
                </svg>
                <div class="absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-base-100 to-transparent" />
                <div class="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-base-100 to-transparent" />
            </div>
        }.into_any(),
    }
}

/// Minimal angular divider - thin diagonal line
#[component]
pub fn SectionDividerMinimal() -> impl IntoView {
    view! {
        <div class="relative w-full h-px my-8">
            <div class="absolute inset-0 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
            <div class="absolute left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-primary/50" />
        </div>
    }
}
