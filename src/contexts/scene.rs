use leptos::prelude::*;

/// Shared drag-suppression timestamp, provided by
/// [`crate::Object3dScene`] and consumed by each nested
/// [`crate::Object3d`].
///
/// When a pan drag ends after moving more than a few pixels, the scene
/// stamps `last_drag_end` with `js_sys::Date::now()`. Each object's click
/// handler checks the timestamp and ignores clicks that arrive within
/// `DRAG_CLICK_SUPPRESS_MS`, so releasing the mouse after panning does not
/// also toggle an object's pinned state.
#[derive(Clone, Copy)]
pub struct SceneContext {
    pub last_drag_end: ReadSignal<f64>,
}

/// How long after a drag ends a click is still treated as part of that
/// drag and suppressed from toggling selection.
pub const DRAG_CLICK_SUPPRESS_MS: f64 = 100.0;
