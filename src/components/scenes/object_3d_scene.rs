use crate::components::ui::object_3d::{
    Attachment, Dimensions, Face, Object3d, Object3dProperties, Position,
};
use crate::contexts::scene::SceneContext;
use leptos::prelude::*;
use std::collections::HashMap;

const DBLCLICK_WINDOW_MS: f64 = 400.0;

/// Resolve an attachment against the blocks already registered, in order.
fn resolve(
    attachment: Option<Attachment>,
    size: Dimensions,
    registry: &HashMap<&'static str, (Position, Dimensions)>,
) -> Position {
    match attachment {
        None => Position {
            x: 0.0,
            y: 0.0,
            z: 0.0,
        },
        Some(Attachment { target, face }) => {
            let (target_pos, target_size) = registry.get(target).copied().unwrap_or_else(|| {
                panic!("Attachment target '{target}' not registered before use")
            });
            let (axis_target_ext, axis_self_ext) = match face {
                Face::Top | Face::Bottom => (target_size.height(), size.height()),
                Face::Left | Face::Right => (target_size.width(), size.width()),
                Face::Front | Face::Back => (target_size.depth(), size.depth()),
            };
            let offset = f64::midpoint(axis_target_ext, axis_self_ext);
            match face {
                Face::Top => Position {
                    z: target_pos.z + offset,
                    ..target_pos
                },
                Face::Bottom => Position {
                    z: target_pos.z - offset,
                    ..target_pos
                },
                Face::Right => Position {
                    x: target_pos.x + offset,
                    ..target_pos
                },
                Face::Left => Position {
                    x: target_pos.x - offset,
                    ..target_pos
                },
                Face::Back => Position {
                    y: target_pos.y + offset,
                    ..target_pos
                },
                Face::Front => Position {
                    y: target_pos.y - offset,
                    ..target_pos
                },
            }
        }
    }
}

/// Collective viewport that hosts the given objects and owns the shared
/// pan/zoom state. Drag with any mouse button pans the whole scene; mouse
/// wheel zooms around the centre; double-tapping the middle button within
/// 400ms resets the view to 1:1 centred (the UI Events spec only fires
/// `dblclick` for the primary button, so the middle-button double-tap is
/// detected by hand). When a drag ends after moving more than 4 pixels,
/// `last_drag_end` is stamped so the click that immediately follows does
/// not also toggle an object's pinned state.
///
/// Attachments are resolved in order: `Attachment { target, face }` looks up
/// `target` among the already-resolved blocks and offsets the new block's
/// centre by half the sum of the two sizes along the attachment axis. A
/// target must appear earlier in `objects` than the block referencing it.
/// After resolution, the entire collection is centered at the origin.
#[component]
#[must_use]
pub fn Object3dScene(objects: Vec<Object3dProperties>) -> impl IntoView {
    const ZOOM_MIN: f64 = 0.25;
    const ZOOM_MAX: f64 = 4.0;
    const ZOOM_STEP: f64 = 1.1;

    let (zoom, set_zoom) = signal(1.0f64);
    let (pan, set_pan) = signal((0.0f64, 0.0f64));
    let (drag_origin, set_drag_origin) = signal(Option::<(f64, f64, f64, f64)>::None);
    let (last_middle_up, set_last_middle_up) = signal(0.0f64);
    let (last_drag_end, set_last_drag_end) = signal(0.0f64);

    provide_context(SceneContext { last_drag_end });

    let mut registry: HashMap<&'static str, (Position, Dimensions)> = HashMap::new();
    let mut resolved: Vec<Object3dProperties> = objects
        .into_iter()
        .map(|mut props| {
            let resolved_pos = resolve(props.attached_to, props.size, &registry);
            registry.insert(props.id, (resolved_pos, props.size));
            props.resolved_position = Some(resolved_pos);
            props
        })
        .collect();

    if !resolved.is_empty() {
        let mut min_x = f64::INFINITY;
        let mut max_x = f64::NEG_INFINITY;
        let mut min_y = f64::INFINITY;
        let mut max_y = f64::NEG_INFINITY;
        let mut min_z = f64::INFINITY;
        let mut max_z = f64::NEG_INFINITY;

        for props in &resolved {
            let Position { x, y, z } = props
                .resolved_position
                .expect("resolved_position must be set");
            let (width, depth, height) = props.size.components();
            let (hw, hd, hh) = (width / 2.0, depth / 2.0, height / 2.0);

            min_x = min_x.min(x - hw);
            max_x = max_x.max(x + hw);
            min_y = min_y.min(y - hd);
            max_y = max_y.max(y + hd);
            min_z = min_z.min(z - hh);
            max_z = max_z.max(z + hh);
        }

        let center_x = f64::midpoint(min_x, max_x);
        let center_y = f64::midpoint(min_y, max_y);
        let center_z = f64::midpoint(min_z, max_z);

        for props in &mut resolved {
            if let Some(pos) = &mut props.resolved_position {
                pos.x -= center_x;
                pos.y -= center_y;
                pos.z -= center_z;
            }
        }

        let mut with_depth: Vec<(usize, f64)> = resolved
            .iter()
            .enumerate()
            .map(|(i, props)| {
                let pos = props
                    .resolved_position
                    .expect("resolved_position must be set");
                let depth = pos.x + pos.y + pos.z;
                (i, depth)
            })
            .collect();
        with_depth.sort_by(|a, b| b.1.partial_cmp(&a.1).unwrap());
        for (depth_idx, (obj_idx, _)) in with_depth.iter().enumerate() {
            resolved[*obj_idx].depth_index = Some(i32::try_from(depth_idx).unwrap_or(0));
        }
    }

    view! {
        <section
            class="object-3d-scene"
            aria-label="Drawing viewport"
            on:wheel=move |ev| {
                ev.prevent_default();
                let factor = if ev.delta_y() < 0.0 { ZOOM_STEP } else { 1.0 / ZOOM_STEP };
                set_zoom.update(|z| {
                    *z = (*z * factor).clamp(ZOOM_MIN, ZOOM_MAX);
                });
            }
            on:pointerdown=move |ev| {
                let (px, py) = pan();
                set_drag_origin(Some((
                    f64::from(ev.client_x()),
                    f64::from(ev.client_y()),
                    px,
                    py,
                )));
            }
            on:pointermove=move |ev| {
                if let Some((sx, sy, px, py)) = drag_origin() {
                    if ev.buttons() == 0 {
                        set_drag_origin(None);
                        return;
                    }
                    let dx = f64::from(ev.client_x()) - sx;
                    let dy = f64::from(ev.client_y()) - sy;
                    set_pan((px + dx, py + dy));
                }
            }
            on:pointerup=move |ev| {
                if ev.button() == 1 {
                    let now = js_sys::Date::now();
                    if now - last_middle_up() < DBLCLICK_WINDOW_MS {
                        ev.prevent_default();
                        set_pan((0.0, 0.0));
                        set_zoom(1.0);
                        set_last_middle_up(0.0);
                    } else {
                        set_last_middle_up(now);
                    }
                }
                if let Some((sx, sy, _, _)) = drag_origin() {
                    let dx = f64::from(ev.client_x()) - sx;
                    let dy = f64::from(ev.client_y()) - sy;
                    if (dx * dx + dy * dy).sqrt() > 4.0 {
                        set_last_drag_end(js_sys::Date::now());
                    }
                }
                set_drag_origin(None);
            }
            on:pointerleave=move |_| set_drag_origin(None)
            on:pointercancel=move |_| set_drag_origin(None)
        >
            <div
                class="object-3d-layer"
                style=move || {
                    let (px, py) = pan();
                    format!("--zoom: {:.3}; --pan-x: {:.2}px; --pan-y: {:.2}px;", zoom(), px, py)
                }
            >
                {resolved
                    .into_iter()
                    .map(|props| view! { <Object3d props=props /> })
                    .collect::<Vec<_>>()}
            </div>
        </section>
    }
}
