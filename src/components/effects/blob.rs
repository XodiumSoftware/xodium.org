//! Animated blob background.
//!
//! One `<svg>` holds every blob as a `<circle>`, all sharing a single
//! `feTurbulence` + `feDisplacementMap` filter. The filter roughens each circle's
//! edge into an organic outline, which is what makes the shapes read as blobs
//! rather than discs; sharing one filter keeps the cost to a single turbulence
//! evaluation instead of one per blob.
//!
//! Layout lives in `BLOBS` so the count and placement are tuned in one place,
//! the same way `Subprojects` and `MainProjects` keep their rows in `const`
//! slices. The component only paints; the host element positions and sizes it.
//!
//! The circles animate from `public/style.css` (`.blob-circle`,
//! `@keyframes blob-breathe`), not from the markup. Two details there are load
//! bearing rather than stylistic: the animation is confined to `transform`, which
//! the compositor applies without re-evaluating the turbulence filter, and
//! `transform-box: fill-box` makes each circle scale about its own centre rather
//! than the SVG's origin, so the cluster drifts instead of sliding as one piece.

use leptos::prelude::*;

/// A single blob in the group.
struct Blob {
    /// Centre in the 100 × 100 view box.
    cx: f64,
    /// Centre in the 100 × 100 view box.
    cy: f64,
    /// Radius in view-box units.
    r: f64,
    /// Palette token supplying the fill.
    color: &'static str,
    /// Per-blob animation delay, so the cluster never pulses in unison.
    delay: &'static str,
}

/// Blobs painted back to front.
///
/// Positions are scattered rather than gridded so the wash never reads as a
/// pattern. The view box is square while the host stretches it, so radii are
/// chosen to stay soft at both aspect ratios.
const BLOBS: &[Blob] = &[
    Blob {
        cx: 14.0,
        cy: 22.0,
        r: 20.0,
        color: "var(--color-primary)",
        delay: "-2s",
    },
    Blob {
        cx: 84.0,
        cy: 74.0,
        r: 22.0,
        color: "var(--color-secondary)",
        delay: "-5s",
    },
    Blob {
        cx: 40.0,
        cy: 68.0,
        r: 15.0,
        color: "var(--color-primary)",
        delay: "-8s",
    },
    Blob {
        cx: 68.0,
        cy: 26.0,
        r: 14.0,
        color: "var(--color-secondary)",
        delay: "-3s",
    },
    Blob {
        cx: 52.0,
        cy: 46.0,
        r: 12.0,
        color: "var(--color-accent)",
        delay: "-6s",
    },
    Blob {
        cx: 22.0,
        cy: 82.0,
        r: 11.0,
        color: "var(--color-secondary)",
        delay: "-1s",
    },
    Blob {
        cx: 90.0,
        cy: 34.0,
        r: 10.0,
        color: "var(--color-primary)",
        delay: "-7s",
    },
    Blob {
        cx: 62.0,
        cy: 88.0,
        r: 9.0,
        color: "var(--color-accent)",
        delay: "-4s",
    },
];

/// Identifier of the shared roughening filter.
const FILTER_ID: &str = "blob-goo";

/// Props for [`BlobBackground`].
#[derive(Clone, Copy)]
#[must_use]
pub struct BlobBackgroundProperties {
    /// Extra classes applied to the `<svg>`, so a host can position and size it.
    pub class: &'static str,
}

/// Animated blob background.
///
/// Renders nothing but the `<svg>`; the caller supplies its placement through
/// [`BlobBackgroundProperties::class`]. The markup is decorative, so it is
/// hidden from assistive technology and cannot take focus.
#[component]
#[must_use]
pub fn BlobBackground(
    /// Configuration: host classes.
    props: BlobBackgroundProperties,
) -> impl IntoView {
    let BlobBackgroundProperties { class } = props;

    let circles = BLOBS
        .iter()
        .map(|blob| {
            view! {
                <circle
                    class="blob-circle"
                    cx=blob.cx.to_string()
                    cy=blob.cy.to_string()
                    r=blob.r.to_string()
                    fill=blob.color
                    style=format!("--blob-delay: {};", blob.delay)
                />
            }
        })
        .collect_view();

    view! {
        <svg
            class=class
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
            focusable="false"
        >
            <defs>
                <filter id=FILTER_ID x="-25%" y="-25%" width="150%" height="150%">
                    <feTurbulence
                        type_="fractalNoise"
                        baseFrequency="0.012"
                        numOctaves="3"
                        seed="7"
                        result="noise"
                    />
                    <feDisplacementMap
                        in_="SourceGraphic"
                        in2="noise"
                        scale="14"
                        xChannelSelector="R"
                        yChannelSelector="G"
                    />
                </filter>
            </defs>
            <g filter=format!("url(#{FILTER_ID})")>{circles}</g>
        </svg>
    }
}
