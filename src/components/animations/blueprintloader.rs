use leptos::prelude::*;

/// Blueprint wireframe card loader that draws itself edge-by-edge like a CAD draft,
/// then runs a scanning beam across the surface until data resolves.
#[component]
pub fn BlueprintCardLoader(#[prop(default = "")] class: &'static str) -> impl IntoView {
    view! {
        <div class={format!("relative flex items-center justify-center py-12 {}", class)}>
            <svg
                class="w-full max-w-xs h-auto"
                viewBox="0 0 340 220"
                xmlns="http://www.w3.org/2000/svg"
                aria-label="Loading project data"
            >
                // Static underlay (dim blueprint)
                <g
                    stroke="var(--color-primary)"
                    stroke-width="1"
                    fill="none"
                    stroke-opacity="0.08"
                >
                    <rect x="20" y="20" width="300" height="180" />
                    <line x1="20" y1="55" x2="320" y2="55" />
                    <line x1="20" y1="85" x2="320" y2="85" />
                    <line x1="20" y1="115" x2="320" y2="115" />
                    <line x1="20" y1="145" x2="320" y2="145" />
                    <line x1="20" y1="175" x2="320" y2="175" />
                </g>

                // Animated border — draws perimeter sequentially
                <path
                    d="M 20,20 L 320,20 L 320,200 L 20,200 Z"
                    class="blueprint-card-border"
                    stroke="var(--color-primary)"
                    stroke-width="2"
                    fill="none"
                    stroke-linecap="square"
                    stroke-linejoin="miter"
                    pathLength="100"
                />

                // Corner frame brackets (CAD detail)
                <g
                    stroke="var(--color-primary)"
                    stroke-width="1.5"
                    fill="none"
                    stroke-linecap="square"
                >
                    <line x1="20" y1="35" x2="20" y2="20" class="blueprint-corner" pathLength="100" />
                    <line x1="20" y1="20" x2="35" y2="20" class="blueprint-corner" pathLength="100" />

                    <line x1="305" y1="20" x2="320" y2="20" class="blueprint-corner" pathLength="100" />
                    <line x1="320" y1="20" x2="320" y2="35" class="blueprint-corner" pathLength="100" />

                    <line x1="320" y1="185" x2="320" y2="200" class="blueprint-corner" pathLength="100" />
                    <line x1="320" y1="200" x2="305" y2="200" class="blueprint-corner" pathLength="100" />

                    <line x1="35" y1="200" x2="20" y2="200" class="blueprint-corner" pathLength="100" />
                    <line x1="20" y1="200" x2="20" y2="185" class="blueprint-corner" pathLength="100" />
                </g>

                // Internal construction lines (title, badges, body, footer)
                <g
                    stroke="var(--color-primary)"
                    stroke-width="1.5"
                    fill="none"
                    stroke-linecap="round"
                >
                    // Title line
                    <line
                        x1="50" y1="42" x2="300" y2="42"
                        class="blueprint-line"
                        pathLength="100"
                    />
                    // Icon square
                    <rect
                        x="30" y="34" width="12" height="12"
                        class="blueprint-line"
                        pathLength="100"
                    />

                    // Badge stubs
                    <line x1="30" y1="70" x2="70" y2="70" class="blueprint-line" pathLength="100" />
                    <line x1="80" y1="70" x2="130" y2="70" class="blueprint-line" pathLength="100" />
                    <line x1="140" y1="70" x2="180" y2="70" class="blueprint-line" pathLength="100" />

                    // Description lines
                    <line x1="30" y1="100" x2="300" y2="100" class="blueprint-line" pathLength="100" />
                    <line x1="30" y1="118" x2="270" y2="118" class="blueprint-line" pathLength="100" />
                    <line x1="30" y1="136" x2="220" y2="136" class="blueprint-line" pathLength="100" />

                    // Footer separator
                    <line x1="30" y1="162" x2="310" y2="162" class="blueprint-line" pathLength="100" />

                    // Language dot + text
                    <circle cx="40" cy="182" r="3" class="blueprint-line" pathLength="100" />
                    <line x1="52" y1="182" x2="100" y2="182" class="blueprint-line" pathLength="100" />

                    // Star crosshair icon
                    <path d="M 280,182 L 290,182 M 285,177 L 285,187" class="blueprint-line" pathLength="100" />
                    <line x1="300" y1="182" x2="310" y2="182" class="blueprint-line" pathLength="100" />
                </g>

                // Measurement ticks (CAD authenticity)
                <g
                    stroke="var(--color-primary)"
                    stroke-width="1"
                    fill="none"
                    stroke-opacity="0.4"
                >
                    <line x1="20" y1="15" x2="20" y2="20" />
                    <line x1="170" y1="15" x2="170" y2="20" />
                    <line x1="320" y1="15" x2="320" y2="20" />

                    <line x1="15" y1="20" x2="20" y2="20" />
                    <line x1="15" y1="110" x2="20" y2="110" />
                    <line x1="15" y1="200" x2="20" y2="200" />
                </g>

                // Scan beam — sweeps down continuously after draw completes
                <rect
                    x="20" y="20"
                    width="300" height="4"
                    class="blueprint-scan-beam"
                    fill="var(--color-primary)"
                    fill-opacity="0.25"
                />
            </svg>
        </div>
    }
}
