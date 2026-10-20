use crate::components::ui::object_3d::{Attachment, Object3dProperties, Position};
use leptos::prelude::*;

/// Properties for the `AxisGizmo` component.
#[derive(Clone, Copy)]
pub struct AxisGizmoProperties {
    /// Attachment to another object in the scene.
    pub attached_to: Attachment,
}

impl From<AxisGizmoProperties> for Object3dProperties {
    fn from(props: AxisGizmoProperties) -> Self {
        Self {
            id: "axis_gizmo",
            name: "Axis Gizmo",
            size: crate::components::ui::object_3d::Dimensions::Cube(1.0),
            attached_to: Some(props.attached_to),
            resolved_position: None,
            depth_index: None,
            colors: None,
            is_draft: false,
            url: None,
        }
    }
}

/// Axis gizmo component that displays the isometric coordinate system.
/// Shows X, Y, and Z axes with their directions in the isometric projection
/// used by the scene. Can be placed like any other object in the scene.
#[component]
#[must_use]
pub fn AxisGizmo(props: Object3dProperties) -> impl IntoView {
    const COS30: f64 = 0.866_025_403_784_438_6;
    const SIN30: f64 = 0.5;
    const GIZMO_SIZE: f64 = 30.0;

    let project = move |x: f64, y: f64, z: f64| ((x - y) * COS30, (x + y) * SIN30 - z);

    let Position { x, y, z } = props
        .resolved_position
        .expect("resolved_position must be set by Object3dScene");

    let (screen_x, screen_y) = project(x, y, z);

    let origin = (0.0, 0.0);
    let x_end = project(GIZMO_SIZE, 0.0, 0.0);
    let y_end = project(0.0, GIZMO_SIZE, 0.0);
    let z_end = project(0.0, 0.0, GIZMO_SIZE);

    view! {
        <div
            class="axis-gizmo"
            aria-label="Coordinate system reference"
            style=format!(
                "position: absolute; left: calc(50% + {:.2}px); top: calc(50% + {:.2}px); pointer-events: none; z-index: 999;",
                screen_x,
                screen_y
            )
        >
            <svg
                viewBox="-40 -40 80 80"
                xmlns="http://www.w3.org/2000/svg"
                role="img"
                aria-hidden="true"
                style="width: 80px; height: 80px;"
            >
                <defs>
                    <style>
                        {".axis-line { stroke-width: 2; opacity: 0.9; }"}
                        {".axis-x { stroke: var(--color-error); }"}
                        {".axis-y { stroke: var(--color-success); }"}
                        {".axis-z { stroke: var(--color-info); }"}
                        {".axis-label { font-family: monospace; font-size: 10px; fill: currentColor; opacity: 0.7; }"}
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
                    x={format!("{:.2}", x_end.0 + 8.0)}
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
                    x={format!("{:.2}", y_end.0 - 8.0)}
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
                    y={format!("{:.2}", z_end.1 - 8.0)}
                >
                    Z
                </text>
            </svg>
        </div>
    }
}
