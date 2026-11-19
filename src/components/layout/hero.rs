//! Hero band: the whole focal region of the sheet.
//!
//! Two halves, one per main project, split horizontally: Cadiotheka on the left
//! and the unannounced project on the right. Nothing selects between them; each
//! half links to its own project.

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

/// Shared face of a feature tile: opaque, on the page's own surface token.
const TILE_CLASS: &str = "bg-base-100 border border-base-content/30 p-3";

/// Corner rounding for the tile at `index`, in reading order.
///
/// Each tile rounds two opposite corners, stepping one corner around the card per
/// tile, so the grid reads as a run of cut plates rather than a stack of boxes.
/// Every tile keeps a pair, first and last included, so the set has no plain
/// outlier. The cycle is six long, matching the tile count, and wraps for any
/// longer list.
///
/// Below `md` the tiles stack in one column, where a right-hand rounding has
/// nothing opposite it; the rounding is therefore `md:`-scoped.
#[must_use]
fn tile_shape(index: usize) -> &'static str {
    const SHAPES: [&str; 6] = [
        "md:rounded-tr-2xl md:rounded-bl-2xl",
        "md:rounded-br-2xl md:rounded-tl-2xl",
        "md:rounded-bl-2xl md:rounded-tr-2xl",
        "md:rounded-tl-2xl md:rounded-br-2xl",
        "md:rounded-tr-2xl md:rounded-bl-2xl",
        "md:rounded-tl-2xl md:rounded-br-2xl",
    ];

    SHAPES[index % SHAPES.len()]
}

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
                columns="grid-cols-2"
                visit_href=Some("https://cadiotheka.com/")
            />

            <HeroHalf
                header=COMING_SOON_HEADER
                paint=COMING_SOON_PAINT
                features=&[]
                columns="grid-cols-1"
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
    /// Column utilities for the tile grid from `md` up.
    columns: &'static str,
    /// Destination the whole half links to; `None` makes the half inert.
    visit_href: Option<&'static str>,
) -> impl IntoView {
    let panel_class = format!(
        "relative flex w-full flex-col gap-4 border border-base-content/30 bg-base-100 p-6 transition-colors duration-200 md:w-1/2 has-[a:hover]:border-primary has-[a:hover]:bg-base-content/5 has-[a:focus-visible]:border-primary has-[a:focus-visible]:bg-base-content/5 {paint}",
    );

    let content_class = if visit_href.is_some() {
        "pointer-events-none relative z-1 flex flex-col gap-4"
    } else {
        "relative z-1 flex flex-col gap-4 opacity-60"
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
                <FeatureGrid items=features columns=columns />
            </div>
        </article>
    }
}

/// The feature tiles of one half.
///
/// An empty slice renders nothing rather than an empty grid, so a half that has
/// no tiles yet keeps its heading and description alone.
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
                .enumerate()
                .map(|(index, item)| {
                    let tile_class = format!("{TILE_CLASS} {}", tile_shape(index));
                    view! {
                        <div class=tile_class>
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
