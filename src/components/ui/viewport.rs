use leptos::prelude::*;

/// A single orthographic viewport — the framed drawing pane used on technical
/// drawings to show one view (front, side, plan, etc.) of a subject.
///
/// The frame is deliberately plain: a double-bordered box with a small title
/// cell in the bottom right, matching engineering-drawing viewport conventions.
/// Content lives in the [`children`] slot; the view is empty until you place
/// geometry there.
#[component]
#[must_use]
pub fn Viewport(
    /// Short label shown in the viewport's title cell (e.g. "FRONT", "{placeholder}").
    #[prop(into)]
    title: String,
    children: Children,
) -> impl IntoView {
    view! {
        <figure class="viewport">
            <div class="viewport-body">
                {children()}
            </div>
            <figcaption class="viewport-title font-mono uppercase">
                {title}
            </figcaption>
        </figure>
    }
}
