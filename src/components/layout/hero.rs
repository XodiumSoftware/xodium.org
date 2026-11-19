//! Hero band: the whole focal region of the sheet.
//!
//! Two halves, one per main project, split horizontally: Cadiotheka on the left
//! and the unannounced project on the right. Nothing selects between them; each
//! half links to its own project.

use crate::components::layout::main::SheetEntrance;
use crate::components::ui::icons::arrow_right::ArrowRightIcon;
use crate::components::ui::icons::branch::BranchIcon;
use crate::components::ui::icons::creators::CreatorsIcon;
use crate::components::ui::icons::ghost::GhostIcon;
use crate::components::ui::icons::history::HistoryIcon;
use crate::components::ui::icons::hub::HubIcon;
use crate::components::ui::icons::inspect::InspectIcon;
use crate::components::ui::icons::speed::SpeedIcon;
use leptos::prelude::*;

/// A feature tile inside a project half.
#[derive(Clone, Copy)]
struct Feature {
    /// Tile heading, rendered as an `h3`.
    title: &'static str,
    /// Short supporting text.
    body: &'static str,
    /// Glyph drawn before the heading.
    icon: fn() -> AnyView,
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
        icon: || view! { <HubIcon /> }.into_any(),
    },
    Feature {
        title: "Open source",
        body: "Read every line, and be part of it by contributing.",
        icon: || view! { <BranchIcon /> }.into_any(),
    },
    Feature {
        title: "Versioned parts",
        body: "Every revision kept.",
        icon: || view! { <HistoryIcon /> }.into_any(),
    },
    Feature {
        title: "Built for creators",
        body: "Attribution, downloads and collaborators come with the upload.",
        icon: || view! { <CreatorsIcon /> }.into_any(),
    },
    Feature {
        title: "Fast by design",
        body: "Compiled to WASM, no install, just a browser.",
        icon: || view! { <SpeedIcon /> }.into_any(),
    },
    Feature {
        title: "Inspect before you download",
        body: "Every model opens in a built-in 3D viewer, no CAD software needed.",
        icon: || view! { <InspectIcon /> }.into_any(),
    },
    Feature {
        title: "Stop reading. Start building",
        body: "The whole hub is a click away.",
        icon: || view! { <ArrowRightIcon /> }.into_any(),
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

/// Entrance animation for a tile, staggered by its index.
///
/// The delay is an inline custom property rather than a utility: Tailwind only
/// emits classes it can see in the source, and a per-index class is built at
/// runtime, so a `[--tile-delay:…]` utility would silently do nothing.
#[must_use]
fn tile_enter(index: usize) -> (&'static str, String) {
    (
        "tile-enter",
        format!("--tile-delay: {}ms;", 700 + index * 90),
    )
}

/// Face of a tile that stands in for a project that has not shipped: unfilled, so it
/// cannot be mistaken for content. Same padding and corners as [`TILE_CLASS`].
const RESERVED_TILE_CLASS: &str = "border border-dashed border-base-content/30 p-3";

/// Filler inside a reserved tile: blurred, `aria-hidden`, and lorem ipsum so it
/// never reads as a withheld feature.
const RESERVED_PLACEHOLDER: (&str, &str) = (
    "Lorem ipsum dolor",
    "Sit amet consectetur adipiscing elit sed do eiusmod tempor.",
);

/// What a half shows where its tiles go.
#[derive(Clone, Copy)]
enum TileKind {
    /// Each feature rendered as its own tile.
    Features,
    /// Blank tiles at a fixed count, on the reserved face.
    Reserved(usize),
}

/// Tiles reserved in the Coming Soon half, so it matches the height of a filled
/// half without naming features that do not exist yet.
const RESERVED_TILE_COUNT: usize = 3;

/// Corner rounding for the tile at `index`, in reading order: two opposite corners,
/// stepping one corner per tile. `md:`-scoped, because stacked tiles have no
/// opposite corner to balance against.
#[must_use]
fn tile_shape(index: usize) -> &'static str {
    const SHAPES: [&str; 7] = [
        "md:rounded-tr-2xl md:rounded-bl-2xl",
        "md:rounded-br-2xl md:rounded-tl-2xl",
        "md:rounded-bl-2xl md:rounded-tr-2xl",
        "md:rounded-tl-2xl md:rounded-br-2xl",
        "md:rounded-tr-2xl md:rounded-bl-2xl",
        "md:rounded-tl-2xl md:rounded-br-2xl",
        "md:rounded-tr-2xl md:rounded-bl-2xl",
    ];

    SHAPES[index % SHAPES.len()]
}

/// Hero band.
///
/// Grows into the sheet's leftover height (`flex-1`) with a `min-h-*` floor; the
/// pair keeps the band from collapsing. Two equal halves in a row from `md` up,
/// stacked below it.
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
                tiles=TileKind::Features
                features=CADIOTHEKA_FEATURES
                columns="grid-cols-2"
                visit_href=Some("https://cadiotheka.com/")
                full_width_last=true
            />

            <HeroHalf
                header=COMING_SOON_HEADER
                paint=COMING_SOON_PAINT
                tiles=TileKind::Reserved(RESERVED_TILE_COUNT)
                features=&[]
                columns="grid-cols-1"
                visit_href=None
                full_width_last=false
            />
        </section>
    }
}

/// One half of the hero band.
///
/// The whole panel is one stretched link (`absolute inset-0`), and the panel is
/// the `group` its hover styling keys off. A half with no destination renders a
/// disabled button instead of a dead anchor, and takes none of the hover styling.
#[component]
fn HeroHalf(
    /// The half's heading row.
    header: HalfHeader,
    /// Paint class filling the panel, or `""` for a plain surface.
    paint: &'static str,
    /// Whether the half lists features or reserves space for them.
    tiles: TileKind,
    /// Tiles shown in the half, in reading order.
    features: &'static [Feature],
    /// Column utilities for the tile grid from `md` up.
    columns: &'static str,
    /// Destination the whole half links to; `None` makes the half inert.
    visit_href: Option<&'static str>,
    /// Stretch the final tile across the row, for a tile count that does not fill
    /// the grid. Without it an odd count leaves a hole beside the last card.
    full_width_last: bool,
) -> impl IntoView {
    let panel_class = format!(
        "group relative flex w-full flex-col gap-4 border border-base-content/30 bg-base-100 p-6 transition-colors duration-200 md:w-1/2 has-[a:hover]:border-primary has-[a:hover]:bg-base-content/5 has-[a:focus-visible]:border-primary has-[a:focus-visible]:bg-base-content/5 {paint}",
    );

    let content_class = if visit_href.is_some() {
        "pointer-events-none relative z-1 flex flex-col gap-4"
    } else {
        "relative z-1 flex flex-col gap-4 opacity-60"
    };

    let arrow_class = if visit_href.is_some() {
        "opacity-60 group-hover:opacity-100 group-hover:text-primary group-hover:-translate-y-0.5 transition-[transform,color,opacity]"
    } else {
        "opacity-60"
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
                    <h2 class="flex items-center gap-1 text-sm font-semibold uppercase tracking-[0.08em]">
                        {header.title}
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            class=arrow_class
                            aria-hidden="true"
                        >
                            <path d="M7 7h10v10"></path>
                            <path d="M7 17 17 7"></path>
                        </svg>
                    </h2>
                    <p class="text-xs uppercase tracking-widest opacity-50">
                        {header.established}
                    </p>
                </header>
                <p class="text-xs leading-relaxed text-base-content/70">
                    {header.description}
                </p>
                <FeatureGrid
                    tiles=tiles
                    items=features
                    columns=columns
                    full_width_last=full_width_last
                />
            </div>
        </article>
    }
}

/// The tile area of one half: either the real features or reserved slots, as
/// [`TileKind`] says.
#[component]
fn FeatureGrid(
    /// Whether the half lists features or reserves space for them.
    tiles: TileKind,
    /// Tiles to render, in reading order.
    items: &'static [Feature],
    /// Column utilities for the grid from `md` up.
    columns: &'static str,
    /// Whether the last tile spans the full row.
    full_width_last: bool,
) -> impl IntoView {
    let grid_class = format!("grid grid-cols-1 gap-3 md:{columns}");

    let last = items.len().saturating_sub(1);
    let span = if full_width_last {
        "md:col-span-full"
    } else {
        ""
    };

    let cells = match tiles {
        TileKind::Features => items
            .iter()
            .enumerate()
            .map(|(index, item)| {
                let (enter_class, enter_style) = tile_enter(index);
                let tile_class = format!(
                    "{TILE_CLASS} {} {} {enter_class}",
                    tile_shape(index),
                    if index == last { span } else { "" },
                );
                view! {
                    <div class=tile_class style=enter_style>
                        <h3 class="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.08em]">
                            {(item.icon)()}
                            {item.title}
                        </h3>
                        <p class="text-xs leading-relaxed opacity-60">{item.body}</p>
                    </div>
                }
                .into_any()
            })
            .collect_view(),
        TileKind::Reserved(count) => (0..count)
            .map(|index| {
                let (enter_class, enter_style) = tile_enter(index);
                let tile_class = format!(
                    "{RESERVED_TILE_CLASS} {} {enter_class}",
                    tile_shape(index),
                );
                let (title, body) = RESERVED_PLACEHOLDER;
                view! {
                    <div class=tile_class style=enter_style aria-hidden="true">
                        <h3 class="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.08em] blur-[3px]">
                            <GhostIcon />
                            {title}
                        </h3>
                        <p class="text-xs leading-relaxed opacity-60 blur-[3px]">{body}</p>
                    </div>
                }
                .into_any()
            })
            .collect_view(),
    };

    view! { <div class=grid_class>{cells}</div> }.into_any()
}
