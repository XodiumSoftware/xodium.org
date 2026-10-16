use leptos::prelude::*;

#[derive(Clone, Copy)]
pub struct BuildingBlockProperties {
    /// Width along the X axis (screen right-down in projection).
    pub width: f64,
    /// Depth along the Y axis (screen left-down in projection).
    pub depth: f64,
    /// Height along the Z axis (screen up).
    pub height: f64,
    /// Display name shown in the tooltip on hover / when pinned.
    pub name: &'static str,
}

impl Default for BuildingBlockProperties {
    fn default() -> Self {
        Self {
            width: 80.0,
            depth: 40.0,
            height: 60.0,
            name: "Building Block",
        }
    }
}

/// Isometric wireframe skeleton of a rectangular box, drawn per engineering
/// convention (ISO 128 / ASME Y14.2 hidden lines).
///
/// The box is projected with the classic 30-degree isometric transform:
/// `screen_x = (x - y) * cos(30°)`, `screen_y = (x + y) * sin(30°) - z`. For
/// a perfect cube the eight vertices collapse onto a regular hexagon with the
/// front-top and back-bottom corners coinciding at the center; for non-cubic
/// extents the hexagon stretches accordingly.
///
/// Faces are translucent-filled from the DaisyUI theme (top = primary, left =
/// secondary, right = accent) and edges are stroked in `base-content`. The
/// three hidden edges meeting at the back-bottom vertex are dashed.
///
/// Clicking the block toggles a pinned "selected" state via DaisyUI's
/// `tooltip-open` class; the block stays lifted and the tooltip stays visible
/// until clicked again. Keyboard-accessible via Enter or Space.
#[component]
#[must_use]
pub fn BuildingBlock(props: BuildingBlockProperties) -> impl IntoView {
    const COS30: f64 = 0.866_025_403_784_438_6;
    const SIN30: f64 = 0.5;

    let (selected, set_selected) = signal(false);

    let BuildingBlockProperties {
        width,
        depth,
        height,
        name,
    } = props;
    let (hw, hd, hh) = (width / 2.0, depth / 2.0, height / 2.0);

    let project = move |x: f64, y: f64, z: f64| ((x - y) * COS30, (x + y) * SIN30 - z);

    let back_top = project(-hw, -hd, hh);
    let right_top = project(hw, -hd, hh);
    let left_top = project(-hw, hd, hh);
    let front_top = project(hw, hd, hh);
    let back_bottom = project(-hw, -hd, -hh);
    let right_bottom = project(hw, -hd, -hh);
    let left_bottom = project(-hw, hd, -hh);
    let front_bottom = project(hw, hd, -hh);

    let fmt_pt = |p: (f64, f64)| format!("{:.2},{:.2}", p.0, p.1);
    let quad = |a: (f64, f64), b: (f64, f64), c: (f64, f64), d: (f64, f64)| {
        format!("{} {} {} {}", fmt_pt(a), fmt_pt(b), fmt_pt(c), fmt_pt(d))
    };

    let top_face = quad(back_top, right_top, front_top, left_top);
    let left_face = quad(left_top, front_top, front_bottom, left_bottom);
    let right_face = quad(front_top, right_top, right_bottom, front_bottom);

    let extent_x = (hw + hd) * COS30;
    let extent_y = (hw + hd) * SIN30 + hh;
    let max_extent = extent_x.max(extent_y) + 8.0;
    let view_box = format!(
        "{:.2} {:.2} {:.2} {:.2}",
        -max_extent,
        -max_extent,
        max_extent * 2.0,
        max_extent * 2.0
    );

    let tooltip = name.to_string();

    view! {
        <section
            class="building-block tooltip tooltip-top"
            class:tooltip-open=selected
            aria-label=name
            aria-pressed=move || selected.get().to_string()
            role="button"
            tabindex="0"
            data-tip=tooltip
            on:click=move |_| set_selected.update(|s| *s = !*s)
            on:keydown=move |ev| {
                if ev.key() == "Enter" || ev.key() == " " {
                    ev.prevent_default();
                    set_selected.update(|s| *s = !*s);
                }
            }
        >
            <svg
                class="building-block-iso"
                viewBox=view_box
                xmlns="http://www.w3.org/2000/svg"
                role="img"
                aria-hidden="true"
            >
                <g class="iso-face iso-top">
                    <polygon points=top_face />
                </g>
                <g class="iso-face iso-left">
                    <polygon points=left_face />
                </g>
                <g class="iso-face iso-right">
                    <polygon points=right_face />
                </g>
                <g class="iso-edges">
                    <line
                        x1=format!("{:.2}", left_top.0)
                        y1=format!("{:.2}", left_top.1)
                        x2=format!("{:.2}", left_bottom.0)
                        y2=format!("{:.2}", left_bottom.1)
                    />
                    <line
                        x1=format!("{:.2}", right_top.0)
                        y1=format!("{:.2}", right_top.1)
                        x2=format!("{:.2}", right_bottom.0)
                        y2=format!("{:.2}", right_bottom.1)
                    />
                    <line
                        x1=format!("{:.2}", front_top.0)
                        y1=format!("{:.2}", front_top.1)
                        x2=format!("{:.2}", front_bottom.0)
                        y2=format!("{:.2}", front_bottom.1)
                    />
                </g>
                <g class="iso-hidden">
                    <line
                        x1=format!("{:.2}", back_top.0)
                        y1=format!("{:.2}", back_top.1)
                        x2=format!("{:.2}", back_bottom.0)
                        y2=format!("{:.2}", back_bottom.1)
                    />
                    <line
                        x1=format!("{:.2}", back_bottom.0)
                        y1=format!("{:.2}", back_bottom.1)
                        x2=format!("{:.2}", left_bottom.0)
                        y2=format!("{:.2}", left_bottom.1)
                    />
                    <line
                        x1=format!("{:.2}", back_bottom.0)
                        y1=format!("{:.2}", back_bottom.1)
                        x2=format!("{:.2}", right_bottom.0)
                        y2=format!("{:.2}", right_bottom.1)
                    />
                </g>
            </svg>
        </section>
    }
}
