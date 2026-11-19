//! Hero band: the whole focal region of the sheet.
//!
//! Two halves, one per main project, split horizontally: Cadiotheka on the left
//! and the unannounced project on the right. Nothing selects between them; each
//! half links to its own project.

use std::fmt::Write;

use crate::components::layout::main::SheetEntrance;
use leptos::prelude::*;

/// A feature blob inside a project half.
///
/// The blob's position and size are in the cluster's `100 × 100` view box, so the
/// whole set scales with the half rather than with any one card's text.
#[derive(Clone, Copy)]
struct Feature {
    /// Tile heading, rendered as an `h3`.
    title: &'static str,
    /// Short supporting text.
    body: &'static str,
    /// Blob centre and radii in view-box units: `(cx, cy, rx, ry)`.
    placement: (f32, f32, f32, f32),
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

/// Cadiotheka's blobs, in reading order.
///
/// Reading order runs down the left column and then down the right, so the
/// connector between consecutive blobs zigzags through the cluster instead of
/// crossing it. Placements are authored: the fluid look depends on the blobs
/// being evenly spread, which a generator would not reliably give.
const CADIOTHEKA_FEATURES: &[Feature] = &[
    Feature {
        title: "One hub, every tool",
        body: "Browse, publish and track CAD models without leaving the browser.",
        placement: (25.0, 17.0, 22.0, 15.0),
    },
    Feature {
        title: "Open source",
        body: "Read every line, and be part of it by contributing.",
        placement: (23.0, 46.0, 20.0, 14.0),
    },
    Feature {
        title: "Versioned parts",
        body: "Every revision kept.",
        placement: (26.0, 76.0, 21.0, 15.0),
    },
    Feature {
        title: "Built for creators",
        body: "Licensing, attribution and download counts come with the upload.",
        placement: (75.0, 18.0, 22.0, 15.0),
    },
    Feature {
        title: "Fast by design",
        body: "Compiled to WASM, no install, just a browser.",
        placement: (76.0, 47.0, 20.0, 14.0),
    },
    Feature {
        title: "Yours to extend",
        body: "A documented API from day one.",
        placement: (74.0, 77.0, 21.0, 15.0),
    },
];

/// Cadiotheka's heading row.
const CADIOTHEKA_HEADER: HalfHeader = HalfHeader {
    title: "Cadiotheka",
    established: "Est 2026",
    description: "The open hub for CAD creators.",
};

/// Cadiotheka's half paint: the dotted hatch in `public/style.css`.
const CADIOTHEKA_PAINT: &str = "dots";

/// The unannounced project's heading row.
const COMING_SOON_HEADER: HalfHeader = HalfHeader {
    title: "Coming Soon",
    established: "Est XXXX",
    description: "Secret project in the making.",
};

/// The unannounced half's paint: the drafting hatch in `public/style.css`.
const COMING_SOON_PAINT: &str = "hatch";

/// Hero band.
///
/// The band grows into the sheet's leftover height (`flex-1`) with a floor
/// (`min-h-[40rem]`); keep the pair, since the floor is what stops the band
/// collapsing when the halves are short.
///
/// A row of two equal halves from `md` up, stacked below it, so a phone reads one
/// project after the other.
#[component]
#[must_use]
pub fn Hero() -> impl IntoView {
    let entrance = SheetEntrance::use_context();

    view! {
        <section
            class=move || {
                format!(
                    "sheet-band sheet-band-hero {} relative isolate flex min-h-[40rem] flex-1 flex-col divide-y divide-base-content/40 border-x border-b border-base-content/40 md:flex-row md:divide-x md:divide-y-0",
                    entrance.band_class(),
                )
            }
            aria-label="Main projects"
        >
            <HeroHalf
                header=CADIOTHEKA_HEADER
                paint=CADIOTHEKA_PAINT
                features=CADIOTHEKA_FEATURES
                visit_href=Some("https://cadiotheka.com/")
            />

            <HeroHalf
                header=COMING_SOON_HEADER
                paint=COMING_SOON_PAINT
                features=&[]
                visit_href=None
            />
        </section>
    }
}

/// One half of the hero band.
///
/// The whole panel is one link, stretched over it by `absolute inset-0`. The
/// content sits above the link in `z-1` and is `pointer-events-none`, so a click
/// anywhere reaches the link; the panel is never itself an `<a>`, which leaves
/// room for a nested control later.
///
/// The panel is opaque: it paints the page's surface token under any texture, so
/// a half never shows the band behind it.
///
/// Hover and keyboard focus tint the panel: the border turns `primary` and the
/// panel takes the same faint `base-content` wash the subproject cards use, so
/// both link surfaces in the sheet acknowledge the pointer the same way.
/// `has-[a:hover]` and `has-[a:focus-visible]` are keyed to the stretched anchor
/// rather than to the panel itself: the content above the anchor does not receive
/// the pointer, so a plain `hover:` on the panel would not fire everywhere it
/// should.
///
/// A disabled half has no destination, so the stretched element is a `<button>`
/// rather than an anchor: an anchor with a dead `href` still announces itself as
/// a link and still lands in the tab order. The half is then inert — not
/// focusable, not clickable — and dimmed to read as unavailable. Both the gate and
/// the label are withheld, so nothing about it promises a destination.
#[component]
fn HeroHalf(
    /// The half's heading row.
    header: HalfHeader,
    /// Paint class filling the panel, or `""` for a plain surface.
    paint: &'static str,
    /// Tiles shown in the half, in reading order.
    features: &'static [Feature],
    /// Destination the whole half links to; `None` makes the half inert.
    visit_href: Option<&'static str>,
) -> impl IntoView {
    let panel_class = format!(
        "relative flex w-full flex-col gap-4 border border-base-content/30 bg-base-100 p-6 transition-colors duration-200 md:w-1/2 has-[a:hover]:border-primary has-[a:hover]:bg-base-content/5 has-[a:focus-visible]:border-primary has-[a:focus-visible]:bg-base-content/5 {paint}",
    );

    let content_class = if visit_href.is_some() {
        "pointer-events-none relative z-1 flex flex-1 flex-col gap-4"
    } else {
        "relative z-1 flex flex-1 flex-col gap-4 opacity-60"
    };

    view! {
        <article class=panel_class>
            {match visit_href {
                Some(href) => view! {
                    <a href=href class="absolute inset-0 z-0" aria-label=header.title></a>
                }
                    .into_any(),
                None => view! {
                    <button type="button" disabled class="absolute inset-0 z-0"></button>
                }
                    .into_any(),
            }}
            <div class=content_class>
                <header>
                    <h2 class="text-sm font-semibold uppercase tracking-[0.08em]">
                        {header.title}
                    </h2>
                    <p class="text-xs uppercase tracking-widest opacity-50">
                        {header.established}
                    </p>
                </header>
                <p class="text-xs leading-relaxed text-base-content/70">
                    {header.description}
                </p>
                <FluidCluster items=features />
            </div>
        </article>
    }
}

/// The feature blobs of one half, joined in reading order.
///
/// Each blob is drawn twice: once in the `goo` layer, where a blur plus a
/// high-contrast colour matrix makes overlapping shapes fuse into one fluid mass,
/// and once in the text layer on top, which is not part of the filter. Only the
/// backdrop participates in the goo, so the copy stays crisp while the shapes
/// below it melt together.
///
/// The filter input is the cluster's own rendering, which means the fill of every
/// blob must be the layer's paint, not a token per blob: `feColorMatrix` keeps
/// only the alpha channel, so all colour is thrown away and replaced.
///
/// Blobs are placed in a `100 × 100` view box with `preserveAspectRatio="none"`,
/// so the cluster stretches to the panel rather than letterboxing, and the
/// connector is drawn first at a low opacity so it reads as the trail between
/// consecutive blobs instead of as a fifth shape.
///
/// An empty slice renders nothing, so a half with no blobs keeps its heading and
/// description alone.
#[component]
fn FluidCluster(
    /// Blobs to render, in reading order.
    items: &'static [Feature],
) -> impl IntoView {
    if items.is_empty() {
        return ().into_any();
    }

    let blobs = items
        .iter()
        .map(|item| {
            let (cx, cy, rx, ry) = item.placement;
            view! {
                <ellipse
                    class="blob"
                    cx=cx.to_string()
                    cy=cy.to_string()
                    rx=rx.to_string()
                    ry=ry.to_string()
                />
            }
        })
        .collect_view();

    let path = connector_path(items);

    let labels = items
        .iter()
        .map(|item| {
            let (cx, cy, rx, ry) = item.placement;
            let label_width = rx * 1.6;
            view! {
                <foreignObject
                    x=(cx - label_width / 2.0).to_string()
                    y=(cy - ry).to_string()
                    width=label_width.to_string()
                    height=(ry * 2.0).to_string()
                >
                    <div class="flex h-full w-full flex-col justify-center gap-1 text-center">
                        <h3 class="text-xs font-semibold uppercase tracking-[0.08em] text-base-content">
                            {item.title}
                        </h3>
                        <p class="text-[0.625rem] leading-snug text-base-content/60">
                            {item.body}
                        </p>
                    </div>
                </foreignObject>
            }
        })
        .collect_view();

    view! {
        <div class="relative min-h-56 flex-1">
            <svg
                class="absolute inset-0 h-full w-full"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                aria-hidden="true"
            >
                <defs>
                    <filter id="hero-goo" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="1.6" result="blur" />
                        <feColorMatrix
                            in="blur"
                            type="matrix"
                            values="1 0 0 0 0 1 0 0 0 0 1 0 0 0 0 0 0 0 20 -9"
                        />
                    </filter>
                </defs>
                <g filter="url(#hero-goo)" fill="currentColor" class="text-base-content/15">
                    {blobs}
                </g>
                <path
                    d=path
                    fill="none"
                    stroke="currentColor"
                    stroke-width="0.6"
                    stroke-dasharray="2 2"
                    class="text-base-content/25"
                    vector-effect="non-scaling-stroke"
                />
            </svg>
            <svg
                class="absolute inset-0 h-full w-full"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                aria-hidden="true"
            >
                {labels}
            </svg>
        </div>
    }
    .into_any()
}

/// Builds the reading-order trail through the blobs.
///
/// It joins blob centres in order, so it crosses the cluster once per row rather
/// than hugging the gap between the columns. It is drawn faint and dashed, which
/// keeps it reading as a trace between cards instead of as another blob.
fn connector_path(items: &'static [Feature]) -> String {
    let mut path = String::new();

    for (index, item) in items.iter().enumerate() {
        let (cx, cy, _, _) = item.placement;
        let op = if index == 0 { 'M' } else { 'L' };
        let _ = write!(path, "{op}{cx} {cy} ");
    }

    path
}
