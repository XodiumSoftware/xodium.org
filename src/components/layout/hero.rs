//! Hero band: the whole focal region of the sheet.
//!
//! Holds both main projects side by side, Cadiotheka upper-left and the
//! unannounced project lower-right, divided corner to corner. Nothing selects
//! between them.

use crate::components::layout::main::SheetEntrance;
use leptos::prelude::*;

/// A feature tile inside a project half.
#[derive(Clone, Copy)]
struct Feature {
    /// Tile heading, rendered as an `h3`.
    title: &'static str,
    /// Short supporting text.
    body: &'static str,
}

/// Cadiotheka's tiles, in reading order.
const CADIOTHEKA_FEATURES: &[Feature] = &[
    Feature {
        title: "One hub, every tool",
        body: "Browse, publish and track CAD models without leaving the browser.",
    },
    Feature {
        title: "Open source",
        body: "Read every line, and be part of it by contributing.",
    },
    Feature {
        title: "Versioned parts",
        body: "Every revision kept.",
    },
    Feature {
        title: "Built for creators",
        body: "Licensing, attribution and download counts come with the upload.",
    },
    Feature {
        title: "Fast by design",
        body: "Compiled to WASM, no install, just a browser.",
    },
    Feature {
        title: "Yours to extend",
        body: "A documented API from day one.",
    },
];

/// Shared face of a feature tile: opaque, on the page's own surface token.
const TILE_CLASS: &str = "bg-base-100 border border-base-content/30 p-3";

/// Hero band.
///
/// The band grows into the sheet's leftover height (`flex-1`) with a floor
/// (`min-h-[40rem]`); keep the pair, since the floor is what stops the taller
/// half's tiles being clipped. `isolate` keeps the halves' negative layers inside
/// the band. The bottom rule is drawn inside the box so it centres on the border
/// it replaces.
///
/// Below `md` the halves stack and an ordinary `divide-y` separates them; a
/// diagonal there would cut through two paragraphs instead of dividing anything.
#[component]
#[must_use]
pub fn Hero() -> impl IntoView {
    let entrance = SheetEntrance::use_context();

    view! {
        <section
            class=move || {
                format!(
                    "sheet-band sheet-band-hero {} relative isolate flex min-h-[40rem] flex-1 flex-col overflow-hidden divide-y divide-base-content/40 border-x border-b border-base-content/40 md:flex-row md:divide-y-0",
                    entrance.band_class(),
                )
            }
            aria-label="Main projects"
        >
            <span
                class="pointer-events-none absolute inset-x-0 bottom-0 h-px -translate-y-1/2 bg-base-content/40"
                aria-hidden="true"
            ></span>

            <ProjectHalf
                header=CADIOTHEKA_HEADER
                paint=CADIOTHEKA_PAINT
                paint_opacity="opacity-20"
                clip=CLIP_UPPER
                align=ALIGN_UPPER
                features=CADIOTHEKA_FEATURES
                columns="grid-cols-2"
                visit_href="https://cadiotheka.com/"
            />

            <ProjectHalf
                header=COMING_SOON_HEADER
                paint=COMING_SOON_PAINT
                paint_opacity="opacity-100"
                clip=CLIP_LOWER
                align=ALIGN_LOWER
                features=&[]
                columns="grid-cols-1"
                visit_href="#"
            />
        </section>
    }
}

/// A half's heading row.
#[derive(Clone, Copy)]
struct HalfHeader {
    /// Project name, rendered as an `h2`.
    title: &'static str,
    /// Year the project was established.
    established: &'static str,
    /// One line of description.
    description: &'static str,
}

/// Cadiotheka's heading row.
const CADIOTHEKA_HEADER: HalfHeader = HalfHeader {
    title: "Cadiotheka",
    established: "Est 2026",
    description: "The open hub for CAD creators.",
};

/// The unannounced project's heading row.
const COMING_SOON_HEADER: HalfHeader = HalfHeader {
    title: "Coming Soon",
    established: "Est XXXX",
    description: "Secret project in the making.",
};

/// Cadiotheka's half paint: the brand raster in `public/style.css`.
const CADIOTHEKA_PAINT: &str = "mark-cadiotheka";

/// The unannounced half's paint: the drafting hatch in `public/style.css`.
const COMING_SOON_PAINT: &str = "hatch";

/// Clip keeping the band's upper-left triangle, from `md` up.
const CLIP_UPPER: &str = "md:[clip-path:polygon(0_100%,0_0,100%_0,0_100%)_content-box]";

/// Clip keeping the band's lower-right triangle, from `md` up.
///
/// The mirror of [`CLIP_UPPER`]; the two must stay exact mirrors or the halves
/// leave a sliver of band showing along the diagonal.
const CLIP_LOWER: &str = "md:[clip-path:polygon(100%_100%,0_100%,100%_0,100%_100%)_content-box]";

/// The half's hover/focus outline, layered and clipped with the half's own
/// polygon so it traces the triangle rather than its bounding box.
const OUTLINE_CLASS: &str = "pointer-events-none absolute inset-0 border-2 border-primary opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100";

/// One half of the hero: heading, description, feature tiles.
///
/// The whole half is one link, stretched over the panel by `absolute inset-0`.
/// Content sits above it in `z-1` and is `pointer-events-none`, so any click
/// reaches the link; the half is never itself an `<a>`.
///
/// Layers, bottom to top: the `base-100` fill (the halves are separate clipped
/// boxes, so without it the band's surface shows through the sparse textures),
/// the project paint, the hover outline, the link, the content.
#[component]
fn ProjectHalf(
    /// The half's heading row.
    header: HalfHeader,
    /// Paint class filling the half.
    paint: &'static str,
    /// Opacity of the paint layer; the brand raster is loud, the hatch is faint.
    paint_opacity: &'static str,
    /// Clip cutting the half to one side of the diagonal.
    clip: &'static str,
    /// Alignment mirroring the content into this half's triangle.
    align: HalfAlign,
    /// Tiles shown in the half, in reading order.
    features: &'static [Feature],
    /// Column utilities for the tile grid from `md` up.
    columns: &'static str,
    /// Destination the whole half links to.
    visit_href: &'static str,
) -> impl IntoView {
    let paint_class = format!("pointer-events-none absolute inset-0 -z-1 {paint} {paint_opacity}");

    let HalfAlign { axis, items, text } = align;

    let half_class = format!(
        "group relative isolate flex w-full flex-1 flex-col gap-4 p-6 md:w-1/2 {clip} {axis}",
    );

    let outline_class = format!("{OUTLINE_CLASS} {clip}");

    view! {
        <article class=half_class>
            <span class="pointer-events-none absolute inset-0 -z-1 bg-base-100" aria-hidden="true"></span>
            <span class=paint_class aria-hidden="true"></span>
            <span class=outline_class aria-hidden="true"></span>
            <a
                href=visit_href
                class="absolute inset-0 z-0"
                aria-label=header.title
            ></a>
            <div class=format!("pointer-events-none relative z-1 flex w-full flex-col gap-4 {items}")>
                <header class="flex items-center gap-3">
                    <div class="min-w-0">
                        <h2 class=format!("text-sm font-semibold uppercase tracking-[0.08em] underline-offset-4 group-hover:underline group-focus-within:underline {text}")>
                            {header.title}
                        </h2>
                        <p class=format!("text-xs uppercase tracking-widest opacity-50 {text}")>
                            {header.established}
                        </p>
                    </div>
                </header>
                <p class=format!("text-xs leading-relaxed text-base-content/70 {text}")>
                    {header.description}
                </p>
                <div class=format!("w-full {items}")>
                    <FeatureGrid items=features columns=columns />
                </div>
            </div>
        </article>
    }
}

/// How a half's content is placed inside its triangle.
///
/// A clipped half is a triangle, so content anchored to the rectangle's corner
/// would collect where the clip has already bitten away. Each triangle gets the
/// corner it actually owns, mirroring the two halves about the diagonal.
#[derive(Clone, Copy)]
struct HalfAlign {
    /// Vertical placement: `md:`-scoped so stacked halves stay top-aligned.
    axis: &'static str,
    /// Horizontal placement of the content block and its grid.
    items: &'static str,
    /// Text alignment.
    text: &'static str,
}

/// Content in the upper-left triangle.
const ALIGN_UPPER: HalfAlign = HalfAlign {
    axis: "md:justify-start",
    items: "md:items-start",
    text: "md:text-left",
};

/// Content in the lower-right triangle.
const ALIGN_LOWER: HalfAlign = HalfAlign {
    axis: "md:justify-end",
    items: "md:items-end",
    text: "md:text-right",
};

/// The feature tiles of one half.
///
/// One column below `md`, where a paired two-up would read as ragged boxes. An
/// empty slice renders nothing rather than an empty grid.
#[component]
fn FeatureGrid(
    /// Tiles to render, in reading order.
    items: &'static [Feature],
    /// Column utilities for the grid from `md` up.
    columns: &'static str,
) -> impl IntoView {
    if items.is_empty() {
        return ().into_any();
    }

    let grid_class = format!("grid grid-cols-1 gap-3 md:{columns}");

    view! {
        <div class=grid_class>
            {items
                .iter()
                .map(|item| {
                    view! {
                        <div class=TILE_CLASS>
                            <h3 class="text-xs font-semibold uppercase tracking-[0.08em]">
                                {item.title}
                            </h3>
                            <p class="text-xs leading-relaxed opacity-60">{item.body}</p>
                        </div>
                    }
                })
                .collect_view()}
        </div>
    }
    .into_any()
}
