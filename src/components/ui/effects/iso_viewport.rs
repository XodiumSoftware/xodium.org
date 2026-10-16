use leptos::prelude::*;

/// In-flow isometric drawing viewport — a centered rectangle on the sheet
/// containing a true 30° isometric grid, with cell-reference labels around
/// all four edges like a real drawing figure.
///
/// The iso pattern uses the canonical engineering tile geometry:
/// for cell width W, the tile is `W × 2·W·tan(30°)` = `60 × 69.282` px
/// (no rounding, otherwise seams appear). Axis origin sits at the bottom-
/// left (row 1 at the bottom edge), matching how engineering drawings
/// number zone rows from the title block upward.
#[component]
#[must_use]
pub fn IsoViewport() -> impl IntoView {
    view! {
        <figure class="iso-viewport" aria-label="Isometric drawing viewport">
            <IsoColumnLabels />
            <div class="iso-viewport-row">
                <IsoRowLabels />
                <IsoSheet />
                <IsoRowLabels />
            </div>
            <IsoColumnLabels />
        </figure>
    }
}

/// The framed sheet itself — the SVG-drawn isometric surface inside the
/// reference labels. Purely presentational.
#[component]
fn IsoSheet() -> impl IntoView {
    view! {
        <svg
            class="iso-sheet"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
        >
            <defs>
                // True isometric tile: 60px wide × 69.282px tall (60 · 2 · tan(30°)).
                // Draws both diagonal families of the rhombus inside the tile only —
                // no overflow past the tile edge, so the pattern tiles seamlessly.
                <pattern
                    id="iso-grid"
                    width="60"
                    height="69.2820323"
                    patternUnits="userSpaceOnUse"
                >
                    // Verticals at x=0 (tile boundary) and x=60 (next tile), drawn once
                    <line
                        x1="30" y1="0" x2="30" y2="69.2820323"
                        stroke="var(--color-primary)"
                        stroke-width="0.6"
                        stroke-opacity="0.2"
                    />
                    // +30° diagonals
                    <path
                        d="M 0 17.3205081 L 30 0 M 0 51.9615242 L 30 34.6410162 M 0 86.6025403 L 30 69.2820323 M 30 34.6410162 L 60 17.3205081 M 30 69.2820323 L 60 51.9615242"
                        fill="none"
                        stroke="var(--color-primary)"
                        stroke-width="0.6"
                        stroke-opacity="0.24"
                    />
                    // -30° diagonals
                    <path
                        d="M 0 17.3205081 L 30 34.6410162 M 0 51.9615242 L 30 69.2820323 M 30 0 L 60 17.3205081 M 30 34.6410162 L 60 51.9615242 M 30 69.2820323 L 60 86.6025403"
                        fill="none"
                        stroke="var(--color-primary)"
                        stroke-width="0.6"
                        stroke-opacity="0.24"
                    />
                </pattern>
            </defs>
            <rect x="0" y="0" width="100%" height="100%" fill="url(#iso-grid)" />
        </svg>
    }
}

/// Column letters (A, B, C, …) distributed along the top of the viewport, in
/// the same drawing-convention style as the sheet margin labels — outside
/// the framed area, spaced evenly from edge to edge.
#[component]
fn IsoColumnLabels() -> impl IntoView {
    let cols = ["A", "B", "C", "D", "E", "F", "G", "H"];

    view! {
        <div class="iso-viewport-cols" aria-hidden="true">
            {cols
                .iter()
                .map(|letter| view! {
                    <span class="iso-label font-mono">{format!("({letter})")}</span>
                })
                .collect::<Vec<_>>()}
        </div>
    }
}

/// Row numbers (1, 2, 3, …) distributed down the side of the viewport.
/// Origin is at the bottom (1 is the lowest cell), matching how engineering
/// drawings number zone rows upward from the title-block side.
#[component]
fn IsoRowLabels() -> impl IntoView {
    let rows = ["5", "4", "3", "2", "1"];

    view! {
        <div class="iso-viewport-rows" aria-hidden="true">
            {rows
                .iter()
                .map(|num| view! {
                    <span class="iso-label font-mono">{format!("({num})")}</span>
                })
                .collect::<Vec<_>>()}
        </div>
    }
}
