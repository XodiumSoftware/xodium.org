//! `CadioThekaIcon` — Cadiotheka brand glyph.
//!
//! Ported from Cadiotheka's `favicon.svg`: a pair of mirrored chevron brackets
//! pointing inward, one dark and one amber, each with a dot at its vertex and a
//! scattering of dashed ticks that give the mark a drafting feel.

use leptos::prelude::*;

/// A short diagonal tick drawn on the light bracket.
struct Tick {
    /// `x` of the rect's unrotated origin.
    x: f64,
    /// `y` of the rect's unrotated origin.
    y: f64,
    /// Rect width.
    width: f64,
    /// Rect height.
    height: f64,
    /// Clockwise rotation in degrees around the rect origin.
    rotation: f64,
}

/// Ticks scattered along the amber bracket.
const LIGHT_TICKS: &[Tick] = &[
    Tick {
        x: 109.062,
        y: 49.7928,
        width: 7.95494,
        height: 1.32582,
        rotation: 135.0,
    },
    Tick {
        x: 116.562,
        y: 57.2928,
        width: 5.3033,
        height: 1.32582,
        rotation: 135.0,
    },
    Tick {
        x: 94.0624,
        y: 34.7929,
        width: 7.95494,
        height: 1.32582,
        rotation: 135.0,
    },
    Tick {
        x: 101.562,
        y: 42.2928,
        width: 5.3033,
        height: 1.32582,
        rotation: 135.0,
    },
    Tick {
        x: 79.0624,
        y: 19.7929,
        width: 7.95494,
        height: 1.32582,
        rotation: 135.0,
    },
    Tick {
        x: 86.5624,
        y: 27.2929,
        width: 5.3033,
        height: 1.32582,
        rotation: 135.0,
    },
    Tick {
        x: 71.5624,
        y: 12.2929,
        width: 5.3033,
        height: 1.32582,
        rotation: 135.0,
    },
    Tick {
        x: 104.375,
        y: 71.3553,
        width: 1.32582,
        height: 7.95494,
        rotation: 135.0,
    },
    Tick {
        x: 89.3749,
        y: 86.3553,
        width: 1.32582,
        height: 7.95494,
        rotation: 135.0,
    },
    Tick {
        x: 113.75,
        y: 65.7303,
        width: 1.32582,
        height: 5.3033,
        rotation: 135.0,
    },
    Tick {
        x: 74.3749,
        y: 101.355,
        width: 1.32582,
        height: 7.95494,
        rotation: 135.0,
    },
    Tick {
        x: 83.7499,
        y: 95.7303,
        width: 1.32582,
        height: 5.3033,
        rotation: 135.0,
    },
    Tick {
        x: 68.7499,
        y: 110.73,
        width: 1.32582,
        height: 5.3033,
        rotation: 135.0,
    },
    Tick {
        x: 98.7499,
        y: 80.7303,
        width: 1.32582,
        height: 5.3033,
        rotation: 135.0,
    },
];

/// Ticks scattered along the dark bracket.
const DARK_TICKS: &[Tick] = &[
    Tick {
        x: 19.0521,
        y: 49.7928,
        width: 7.95494,
        height: 1.32582,
        rotation: 45.0,
    },
    Tick {
        x: 11.5521,
        y: 57.2928,
        width: 5.3033,
        height: 1.32582,
        rotation: 45.0,
    },
    Tick {
        x: 34.052,
        y: 34.7929,
        width: 7.95494,
        height: 1.32582,
        rotation: 45.0,
    },
    Tick {
        x: 26.552,
        y: 42.2928,
        width: 5.3033,
        height: 1.32582,
        rotation: 45.0,
    },
    Tick {
        x: 49.052,
        y: 19.7929,
        width: 7.95494,
        height: 1.32582,
        rotation: 45.0,
    },
    Tick {
        x: 41.552,
        y: 27.2929,
        width: 5.3033,
        height: 1.32582,
        rotation: 45.0,
    },
    Tick {
        x: 56.552,
        y: 12.2929,
        width: 5.3033,
        height: 1.32582,
        rotation: 45.0,
    },
    Tick {
        x: 23.7396,
        y: 71.3553,
        width: 1.32582,
        height: 7.95494,
        rotation: 45.0,
    },
    Tick {
        x: 38.7395,
        y: 86.3553,
        width: 1.32582,
        height: 7.95494,
        rotation: 45.0,
    },
    Tick {
        x: 14.3646,
        y: 65.7303,
        width: 1.32582,
        height: 5.3033,
        rotation: 45.0,
    },
    Tick {
        x: 53.7395,
        y: 101.355,
        width: 1.32582,
        height: 7.95494,
        rotation: 45.0,
    },
    Tick {
        x: 44.3645,
        y: 95.7303,
        width: 1.32582,
        height: 5.3033,
        rotation: 45.0,
    },
    Tick {
        x: 59.3645,
        y: 110.73,
        width: 1.32582,
        height: 5.3033,
        rotation: 45.0,
    },
    Tick {
        x: 29.3646,
        y: 80.7303,
        width: 1.32582,
        height: 5.3033,
        rotation: 45.0,
    },
];

/// Identifier of the silver gradient, referenced by the amber elements.
const SILVER_GRADIENT_ID: &str = "cadiotheka-silver";

/// `paint` value that fills or strokes with the silver gradient.
const SILVER: &str = "url(#cadiotheka-silver)";

/// Fill of the right-hand bracket, at full strength.
const INK: &str = "#001728";

/// Renders one tick as a rotated rect.
fn tick(tick: &Tick, fill: &'static str) -> impl IntoView {
    view! {
        <rect
            x=tick.x.to_string()
            y=tick.y.to_string()
            width=tick.width.to_string()
            height=tick.height.to_string()
            transform=format!(
                "rotate({} {} {})",
                tick.rotation,
                tick.x,
                tick.y,
            )
            fill=fill
        />
    }
}

/// Renders the Cadiotheka brand glyph as an inline SVG icon.
///
/// The mark is drawn at the favicon's native `128 × 128` view box, so the tick
/// coordinates stay readable side by side with the original asset. Every amber
/// element of the source asset is painted with a shared silver gradient, so the
/// mark reads as brushed metal on the project's orange tile.
#[component]
pub fn CadioThekaIcon() -> AnyView {
    let light_ticks = LIGHT_TICKS.iter().map(|t| tick(t, SILVER)).collect_view();
    let dark_ticks = DARK_TICKS.iter().map(|t| tick(t, INK)).collect_view();

    view! {
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 128 128"
            fill="none"
            aria-hidden="true"
        >
            <defs>
                <linearGradient
                    id=SILVER_GRADIENT_ID
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                >
                    <stop offset="0%" stop-color="#f5f7fa" />
                    <stop offset="40%" stop-color="#d7dce1" />
                    <stop offset="60%" stop-color="#a8b0b8" />
                    <stop offset="100%" stop-color="#eef1f4" />
                </linearGradient>
            </defs>
            <path
                d="M66.1145 56.1621L73.6145 63.6621L66.1145 71.1621V124L126.114 64L66.1145 4V56.1621ZM96.6086 58.3584C99.5375 58.3585 101.911 60.7332 101.911 63.6621C101.911 66.591 99.5374 68.9657 96.6086 68.9658C93.6797 68.9658 91.3049 66.591 91.3049 63.6621C91.3049 60.7332 93.6797 58.3584 96.6086 58.3584Z"
                fill=INK
                stroke=SILVER
                stroke-width="2"
            />
            {light_ticks}
            <path
                d="M62 56.1621L54.5 63.6621L62 71.1621V124L2 64L62 4V56.1621ZM31.5059 58.3584C28.577 58.3585 26.2031 60.7332 26.2031 63.6621C26.2031 66.591 28.577 68.9657 31.5059 68.9658C34.4348 68.9658 36.8095 66.591 36.8096 63.6621C36.8096 60.7332 34.4348 58.3584 31.5059 58.3584Z"
                fill=SILVER
            />
            {dark_ticks}
        </svg>
    }
    .into_any()
}
