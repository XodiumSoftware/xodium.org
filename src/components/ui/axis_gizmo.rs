use leptos::prelude::*;

/// Axis gizmo component that displays the isometric coordinate system in a
/// corner. Shows X, Y, and Z axes with their directions in the isometric
/// projection used by the scene.
#[component]
#[must_use]
pub fn AxisGizmo() -> impl IntoView {
    const COS30: f64 = 0.866_025_403_784_438_6;
    const SIN30: f64 = 0.5;
    const GIZMO_SIZE: f64 = 20.0;

    let project = move |x: f64, y: f64, z: f64| ((x - y) * COS30, (x + y) * SIN30 - z);

    let origin = (0.0, 0.0);
    let x_end = project(GIZMO_SIZE, 0.0, 0.0);
    let y_end = project(0.0, GIZMO_SIZE, 0.0);
    let z_end = project(0.0, 0.0, GIZMO_SIZE);

    view! {
        <div
            class="axis-gizmo"
            aria-label="Coordinate system reference"
            style="position: absolute; bottom: 80px; left: 80px; pointer-events: none;"
        >
            <svg
                viewBox="-30 -30 60 60"
                xmlns="http://www.w3.org/2000/svg"
                role="img"
                aria-hidden="true"
                style="width: 60px; height: 60px;"
            >
                <defs>
                    <style>
                        {".axis-line { stroke-width: 1.5; opacity: 0.8; }"}
                        {".axis-x { stroke: var(--color-error); }"}
                        {".axis-y { stroke: var(--color-success); }"}
                        {".axis-z { stroke: var(--color-info); }"}
                        {".axis-label { font-family: monospace; font-size: 8px; fill: currentColor; opacity: 0.6; }"}
                    </style>
                </defs>
                <line
                    class="axis-line axis-x"
                    x1={format!("{:.2}", origin.0)}
                    y1={format!("{:.2}", origin.1)}
                    x2={format!("{:.2}", x_end.0)}
                    y2={format!("{:.2}", x_end.1)}
                />
                <text
                    class="axis-label"
                    x={format!("{:.2}", x_end.0 + 5.0)}
                    y={format!("{:.2}", x_end.1)}
                >
                    X
                </text>
                <line
                    class="axis-line axis-y"
                    x1={format!("{:.2}", origin.0)}
                    y1={format!("{:.2}", origin.1)}
                    x2={format!("{:.2}", y_end.0)}
                    y2={format!("{:.2}", y_end.1)}
                />
                <text
                    class="axis-label"
                    x={format!("{:.2}", y_end.0 - 5.0)}
                    y={format!("{:.2}", y_end.1)}
                >
                    Y
                </text>
                <line
                    class="axis-line axis-z"
                    x1={format!("{:.2}", origin.0)}
                    y1={format!("{:.2}", origin.1)}
                    x2={format!("{:.2}", z_end.0)}
                    y2={format!("{:.2}", z_end.1)}
                />
                <text
                    class="axis-label"
                    x={format!("{:.2}", z_end.0)}
                    y={format!("{:.2}", z_end.1 - 5.0)}
                >
                    Z
                </text>
            </svg>
        </div>
    }
}
