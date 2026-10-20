use crate::components::ui::axis_gizmo::AxisGizmo;
use crate::components::ui::object_3d::{
    Attachment, Dimensions, Face, Object3d, Object3dProperties, Position,
};
use leptos::prelude::*;
use std::collections::HashMap;

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

/// Collective viewport that hosts the given objects in a static arrangement.
/// Attachments are resolved in order: `Attachment { target, face }` looks up
/// `target` among the already-resolved blocks and offsets the new block's
/// centre by half the sum of the two sizes along the attachment axis. A
/// target must appear earlier in `objects` than the block referencing it.
/// After resolution, the entire collection is centered at the origin.
#[component]
#[must_use]
pub fn Object3dScene(objects: Vec<Object3dProperties>) -> impl IntoView {
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

    let (gizmo_offset_x, gizmo_offset_y, gizmo_elevation) = if resolved.is_empty() {
        (-60.0, -60.0, 60.0)
    } else {
        let mut min_x = f64::INFINITY;
        let mut min_y = f64::INFINITY;
        let mut max_z = f64::NEG_INFINITY;

        for props in &resolved {
            let Position { x, y, z } = props
                .resolved_position
                .expect("resolved_position must be set");
            let (width, depth, height) = props.size.components();
            let (hw, hd, hh) = (width / 2.0, depth / 2.0, height / 2.0);

            min_x = min_x.min(x - hw);
            min_y = min_y.min(y - hd);
            max_z = max_z.max(z + hh);
        }

        (min_x - 60.0, min_y - 60.0, max_z + 60.0)
    };

    view! {
        <section
            class="object-3d-scene"
            aria-label="Drawing viewport"
        >
            <div class="object-3d-layer">
                {resolved
                    .into_iter()
                    .map(|props| view! { <Object3d props=props /> })
                    .collect::<Vec<_>>()}
                <AxisGizmo
                    offset_x=gizmo_offset_x
                    offset_y=gizmo_offset_y
                    elevation=gizmo_elevation
                />
            </div>
        </section>
    }
}
