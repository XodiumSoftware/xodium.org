use leptos::prelude::*;

/// Isometric drawing raster covering the sheet, with column letters along the
/// top edge and row numbers down the left edge — the (A)…(1) reference grid
/// you see on real engineering drawings for locating features by cell.
///
/// The grid is purely presentational (aria-hidden) and rendered as an SVG
/// behind the page content. Gridlines run at 60px pitch on both axes, with
/// the isometric 30° set overlaid at 60px spacing.
#[component]
#[must_use]
pub fn IsoRaster() -> impl IntoView {
    view! {
        <svg
            class="iso-raster"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
        >
            <defs>
                // Isometric tile: rhombus of 60x30 unit spacing (30° rise),
                // plus a fainter square grid underneath for orientation.
                <pattern
                    id="iso-grid"
                    width="60"
                    height="60"
                    patternUnits="userSpaceOnUse"
                >
                    // Square minor grid (very faint, orientation aid)
                    <path
                        d="M 60 0 L 0 0 0 60"
                        fill="none"
                        stroke="var(--color-base-content)"
                        stroke-width="0.5"
                        stroke-opacity="0.06"
                    />
                    // Isometric 30° lines
                    <path
                        d="M 0 30 L 60 0 M 0 60 L 60 30 M 0 90 L 60 60 M 0 60 L 60 90 M 0 30 L 60 60 M 0 0 L 60 30"
                        fill="none"
                        stroke="var(--color-primary)"
                        stroke-width="0.6"
                        stroke-opacity="0.18"
                    />
                    // Diagonals
                    <path
                        d="M 0 0 L 60 60 M 60 0 L 0 60"
                        fill="none"
                        stroke="var(--color-primary)"
                        stroke-width="0.6"
                        stroke-opacity="0.12"
                    />
                </pattern>
            </defs>

            // Full-bleed iso pattern fill
            <rect x="0" y="0" width="100%" height="100%" fill="url(#iso-grid)" />
        </svg>
    }
}

/// Drawing-frame axis labels — a row of (A) (B) (C)... cell references along
/// the top edge, matching the reference designations used on engineering
/// blueprints to locate features by grid cell.
#[component]
#[must_use]
pub fn IsoColumnLabels() -> impl IntoView {
    let cols = ["A", "B", "C", "D", "E", "F", "G", "H", "J", "K"];

    view! {
        <div class="iso-col-labels" aria-hidden="true">
            {cols
                .iter()
                .map(|letter| view! {
                    <span class="iso-label font-mono">{format!("({letter})")}</span>
                })
                .collect::<Vec<_>>()}
        </div>
    }
}

/// Drawing-frame axis labels — a column of (1) (2) (3)... cell references
/// down the left edge.
#[component]
#[must_use]
pub fn IsoRowLabels() -> impl IntoView {
    let rows = ["1", "2", "3", "4", "5", "6"];

    view! {
        <div class="iso-row-labels" aria-hidden="true">
            {rows
                .iter()
                .map(|num| view! {
                    <span class="iso-label font-mono">{format!("({num})")}</span>
                })
                .collect::<Vec<_>>()}
        </div>
    }
}
