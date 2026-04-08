use leptos::prelude::*;

/// Team section background - radial dot pattern with connecting lines
#[component]
pub fn TeamBackground() -> impl IntoView {
    view! {
        <div class="absolute inset-0 pointer-events-none overflow-hidden">
            {/* Dot grid pattern */}
            <svg
                class="absolute inset-0 w-full h-full opacity-30"
                xmlns="http://www.w3.org/2000/svg"
            >
                <defs>
                    <pattern
                        id="teamDotPattern"
                        width="40"
                        height="40"
                        patternUnits="userSpaceOnUse"
                    >
                        <circle
                            cx="20"
                            cy="20"
                            r="1.5"
                            fill="var(--color-primary)"
                            fill-opacity="0.3"
                        />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#teamDotPattern)" />

                {/* Connection lines - random tech-looking connections */}
                <g stroke="var(--color-primary)" stroke-width="0.5" stroke-opacity="0.1">
                    <line x1="10%" y1="20%" x2="25%" y2="35%" />
                    <line x1="25%" y1="35%" x2="20%" y2="60%" />
                    <line x1="80%" y1="15%" x2="70%" y2="40%" />
                    <line x1="70%" y1="40%" x2="85%" y2="55%" />
                    <line x1="40%" y1="70%" x2="60%" y2="80%" />
                    <line x1="15%" y1="75%" x2="30%" y2="85%" />
                </g>

                {/* Highlight circles */}
                <g fill="none" stroke="var(--color-secondary)" stroke-width="1" stroke-opacity="0.2">
                    <circle cx="30%" cy="30%" r="40" />
                    <circle cx="70%" cy="60%" r="60" />
                    <circle cx="20%" cy="70%" r="30" />
                </g>
            </svg>

            {/* Floating accent elements */}
            <div class="absolute top-10 right-10 w-20 h-20 border border-primary/10 rounded-full" />
            <div class="absolute bottom-20 left-20 w-16 h-16 border border-secondary/10 rounded-full" />
            <div class="absolute top-1/2 left-10 w-2 h-2 bg-primary/20 rounded-full" />
            <div class="absolute top-1/3 right-20 w-3 h-3 bg-secondary/20 rounded-full" />
        </div>
    }
}

/// Alternative: Team background with hexagon clusters
#[component]
pub fn TeamBackgroundHex() -> impl IntoView {
    view! {
        <div class="absolute inset-0 pointer-events-none overflow-hidden">
            <svg
                class="absolute inset-0 w-full h-full"
                xmlns="http://www.w3.org/2000/svg"
            >
                {/* Hexagon cluster top-right */}
                <g fill="none" stroke="var(--color-primary)" stroke-width="1" stroke-opacity="0.15">
                    <path d="M800,50 L820,40 L840,50 L840,70 L820,80 L800,70 Z" />
                    <path d="M840,50 L860,40 L880,50 L880,70 L860,80 L840,70" />
                    <path d="M820,80 L840,90 L860,80 L860,100 L840,110 L820,100 Z" />
                </g>

                {/* Hexagon cluster bottom-left */}
                <g fill="none" stroke="var(--color-secondary)" stroke-width="1" stroke-opacity="0.1">
                    <path d="M100,400 L120,390 L140,400 L140,420 L120,430 L100,420 Z" />
                    <path d="M140,400 L160,390 L180,400 L180,420 L160,430 L140,420" />
                    <path d="M120,430 L140,440 L160,430 L160,450 L140,460 L120,450 Z" />
                    <path d="M60,430 L80,420 L100,430 L100,450 L80,460 L60,450 Z" />
                </g>

                {/* Connecting dots */}
                <g fill="var(--color-primary)" fill-opacity="0.2">
                    <circle cx="200" cy="200" r="2" />
                    <circle cx="400" cy="150" r="2" />
                    <circle cx="600" cy="300" r="2" />
                    <circle cx="900" cy="250" r="2" />
                </g>
            </svg>
        </div>
    }
}
