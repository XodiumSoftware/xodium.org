use leptos::prelude::*;

/// In-flow isometric drawing viewport — a centered rectangle on the sheet
/// containing a true 30° isometric grid, with marker-balloon zone labels
/// around all four edges like a real drawing figure.
///
/// The iso pattern uses the canonical engineering tile geometry: for cell
/// width W, the tile is `W × 2·W·tan(30°)` = `60 × 69.282` px (no rounding,
/// otherwise seams appear). Axis origin is bottom-left, matching how
/// engineering drawings number zone rows upward from the title-block side.
///
/// Zone labels are rendered as marker balloons — a small ring containing the
/// reference letter/number with a thin leader line extending to the sheet
/// edge, and a connector line spanning the sheet diagonally opposite so
/// opposite markers read as paired axes.
#[component]
#[must_use]
pub fn IsoViewport() -> impl IntoView {
    view! {
        <figure class="iso-viewport" aria-label="Isometric drawing viewport">
            <IsoColumnLabels edge="top" />
            <div class="iso-viewport-row">
                <IsoRowLabels edge="left" />
                <div class="iso-viewport-stack">
                    <IsoSheet />
                    <IsoConnectors />
                </div>
                <IsoRowLabels edge="right" />
            </div>
            <IsoColumnLabels edge="bottom" />
        </figure>
    }
}

/// Connector lines running through the sheet that pair opposite markers —
/// one vertical line per column letter and one horizontal line per row
/// number, so the markers read as the ends of invisible axes crossing the
/// drawing surface.
///
/// Rendered as an SVG overlay absolutely positioned on top of the sheet,
/// sharing the same coordinate space so the lines line up with the markers.
/// Coordinates use a 0-1 viewBox (with preserveAspectRatio="none") so the
/// proportions scale with the sheet's rendered size.
#[component]
fn IsoConnectors() -> impl IntoView {
    // Column X positions in 0-1 viewBox space. 9 letters distributed with
    // space-around across the sheet; each marker sits at (i + 0.5) / 9 of
    // the sheet width.
    let col_xs: [f64; 9] = [
        1.0 / 18.0,
        3.0 / 18.0,
        5.0 / 18.0,
        7.0 / 18.0,
        9.0 / 18.0,
        11.0 / 18.0,
        13.0 / 18.0,
        15.0 / 18.0,
        17.0 / 18.0,
    ];
    // Row Y positions. 5 rows, same spacing convention. Row index 0
    // (top) is label "5" since origin is bottom-left.
    let row_ys: [f64; 5] = [1.0 / 10.0, 3.0 / 10.0, 5.0 / 10.0, 7.0 / 10.0, 9.0 / 10.0];

    view! {
        <svg
            class="iso-connectors"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1 1"
            preserveAspectRatio="none"
        >
            {col_xs
                .iter()
                .map(|x| view! {
                    <line
                        x1=*x y1="0" x2=*x y2="1"
                        stroke="var(--color-base-content)"
                        stroke-width="0.5"
                        stroke-opacity="0.1"
                        vector-effect="non-scaling-stroke"
                    />
                })
                .collect::<Vec<_>>()}
            {row_ys
                .iter()
                .map(|y| view! {
                    <line
                        x1="0" y1=*y x2="1" y2=*y
                        stroke="var(--color-base-content)"
                        stroke-width="0.5"
                        stroke-opacity="0.1"
                        vector-effect="non-scaling-stroke"
                    />
                })
                .collect::<Vec<_>>()}
        </svg>
    }
}

/// One marker balloon — a ringed circle containing the zone reference
/// (letter or digit) plus a long thin leader line pointing outward to the
/// sheet edge. `edge` controls which way the leader points.
///
/// Each SVG is 32px wide × 64px tall (or transposed for left/right): the
/// marker circle sits at one end, the leader line occupies the rest so the
/// balloon reads as a real callout and the leader visibly reaches the sheet.
#[component]
fn ZoneMarker(
    label: &'static str,
    /// Which side of the sheet this marker sits on: "top", "bottom", "left", "right".
    edge: &'static str,
) -> impl IntoView {
    let (view_box, width, height, circle_cx, circle_cy, leader_path) = match edge {
        "top" => ("0 0 32 64", "32", "64", "16", "16", "M 16 27 L 16 60"),
        "bottom" => ("0 0 32 64", "32", "64", "16", "48", "M 16 4 L 16 37"),
        "left" => ("0 0 64 32", "64", "32", "16", "16", "M 27 16 L 60 16"),
        "right" => ("0 0 64 32", "64", "32", "48", "16", "M 4 16 L 37 16"),
        _ => ("0 0 32 64", "32", "64", "16", "16", ""),
    };

    view! {
        <svg
            class=format!("zone-marker zone-marker-{edge}")
            viewBox=view_box
            width=width
            height=height
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
        >
            // Leader line
            <path
                d=leader_path
                fill="none"
                stroke="currentColor"
                stroke-width="1"
            />
            // Outer ring
            <circle
                cx=circle_cx cy=circle_cy r="11"
                fill="var(--color-base-100)"
                stroke="currentColor"
                stroke-width="1"
            />
            // Inner ring (double-line convention for reference markers)
            <circle
                cx=circle_cx cy=circle_cy r="8.5"
                fill="none"
                stroke="currentColor"
                stroke-width="0.6"
            />
            // Label glyph
            <text
                x=circle_cx y=circle_cy
                text-anchor="middle"
                dominant-baseline="central"
                class="zone-marker-text"
                fill="currentColor"
                stroke="none"
            >
                {label}
            </text>
        </svg>
    }
}

/// Row of column letters (A..I) for one horizontal edge of the sheet.
/// `edge` is "top" or "bottom" — the leader line points toward the sheet.
///
/// Nine columns (odd count) so the middle letter E sits on the raster's
/// horizontal centreline and aligns with the page-grid centring.
#[component]
fn IsoColumnLabels(edge: &'static str) -> impl IntoView {
    let cols = ["A", "B", "C", "D", "E", "F", "G", "H", "I"];

    view! {
        <div class=format!("iso-viewport-cols iso-viewport-cols-{edge}") aria-hidden="true">
            {cols
                .iter()
                .map(|letter| view! { <ZoneMarker label=letter edge=edge /> })
                .collect::<Vec<_>>()}
        </div>
    }
}

/// Column of row numbers (1..5) for one vertical edge of the sheet.
/// Rendered top-to-bottom as 5..1 so row 1 lands at the bottom (origin).
/// `edge` is "left" or "right".
#[component]
fn IsoRowLabels(edge: &'static str) -> impl IntoView {
    let rows = ["5", "4", "3", "2", "1"];

    view! {
        <div class=format!("iso-viewport-rows iso-viewport-rows-{edge}") aria-hidden="true">
            {rows
                .iter()
                .map(|num| view! { <ZoneMarker label=num edge=edge /> })
                .collect::<Vec<_>>()}
        </div>
    }
}

/// The framed sheet itself — currently empty. Kept as the structural
/// container that the row/column markers attach to; drawing content goes
/// inside later.
#[component]
fn IsoSheet() -> impl IntoView {
    view! {
        <div class="iso-sheet" aria-hidden="true"></div>
    }
}
