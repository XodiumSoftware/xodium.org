use leptos::prelude::*;

/// Honeycomb hexagon grid layout for cards
/// Creates a masonry-style hexagonal grid
#[component]
pub fn HexGrid(children: Children) -> impl IntoView {
    view! {
        <div class="hex-grid-container">
            {children()}
        </div>
    }
}

/// Individual hexagonal card wrapper
#[component]
pub fn HexCard(children: Children, #[prop(optional)] class: &'static str) -> impl IntoView {
    view! {
        <div class={format!("hex-card {}", class)}>
            <div class="hex-card-inner">
                {children()}
            </div>
        </div>
    }
}

/// Hexagon background pattern for sections
#[component]
pub fn HexPattern(#[prop(optional)] class: &'static str) -> impl IntoView {
    view! {
        <div class={format!("absolute inset-0 pointer-events-none overflow-hidden {}", class)}>
            <svg
                class="absolute inset-0 w-full h-full opacity-5"
                xmlns="http://www.w3.org/2000/svg"
            >
                <defs>
                    <pattern
                        id="hexPattern"
                        width="56"
                        height="100"
                        patternUnits="userSpaceOnUse"
                    >
                        <path
                            d="M28 66L0 50L0 16L28 0L56 16L56 50L28 66L28 100"
                            fill="none"
                            stroke="var(--color-primary)"
                            stroke-width="1"
                        />
                        <path
                            d="M28 0L28 34L0 50L0 84L28 100L56 84L56 50L28 34"
                            fill="none"
                            stroke="var(--color-primary)"
                            stroke-width="1"
                        />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#hexPattern)" />
            </svg>
        </div>
    }
}
