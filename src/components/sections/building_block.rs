use leptos::prelude::*;

/// Isometric wireframe skeleton of a cube, drawn per engineering convention.
///
/// All 12 edges are rendered: the 9 visible edges as solid strokes (the six
/// hexagon outline segments from the face polygons, plus the three vertical
/// edges drawn explicitly), and the 3 hidden edges meeting at the occluded
/// back-bottom vertex as dashed lines per ISO 128 / ASME Y14.2 hidden-line
/// convention. In isometric projection that hidden vertex coincides on the
/// page with the front-top vertex, so the hidden vertical runs from the top
/// hex corner to the center, and the other two radiate from the center to
/// the lower-left and lower-right hex corners.
#[component]
#[must_use]
pub fn BuildingBlock() -> impl IntoView {
    view! {
        <section
            class="building-block tooltip tooltip-top"
            aria-label="Building block"
            data-tip="Building Block"
        >
            <svg
                class="building-block-iso"
                viewBox="0 0 120 120"
                xmlns="http://www.w3.org/2000/svg"
                role="img"
                aria-hidden="true"
            >
                <g class="iso-face iso-top">
                    <polygon points="60,20 100,40 60,60 20,40" />
                </g>
                <g class="iso-face iso-left">
                    <polygon points="20,40 60,60 60,100 20,80" />
                </g>
                <g class="iso-face iso-right">
                    <polygon points="60,60 100,40 100,80 60,100" />
                </g>
                <g class="iso-edges">
                    <line x1="20" y1="40" x2="20" y2="80" />
                    <line x1="100" y1="40" x2="100" y2="80" />
                    <line x1="60" y1="60" x2="60" y2="100" />
                </g>
                <g class="iso-hidden">
                    <line x1="60" y1="20" x2="60" y2="60" />
                    <line x1="60" y1="60" x2="20" y2="80" />
                    <line x1="60" y1="60" x2="100" y2="80" />
                </g>
            </svg>
        </section>
    }
}
