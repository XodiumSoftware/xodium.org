use leptos::prelude::*;

/// Section wrapper with fade edges at top and bottom
#[component]
pub fn SectionFade(
    children: Children,
    #[prop(default = "")] class: &'static str,
    /// Height of the fade (in pixels)
    #[prop(default = 80)]
    fade_height: i32,
) -> impl IntoView {
    let fade_class = format!("absolute inset-x-0 h-{} pointer-events-none", fade_height);

    view! {
        <div class={format!("relative {}", class)}>
            // Top fade
            <div
                class={format!("{} top-0 bg-gradient-to-b from-base-100 to-transparent z-10", fade_class)}
                style={format!("height: {}px", fade_height)}
            />

            // Content
            {children()}

            // Bottom fade
            <div
                class={format!("{} bottom-0 bg-gradient-to-t from-base-100 to-transparent z-10", fade_class)}
                style={format!("height: {}px", fade_height)}
            />
        </div>
    }
}

/// Simple fade overlay for any section
#[component]
pub fn FadeOverlay(
    #[prop(default = "")] position: &'static str,
    /// Height of the fade in tailwind spacing
    #[prop(default = "20")]
    height: &'static str,
) -> impl IntoView {
    match position {
        "top" => view! {
            <div class={format!("absolute inset-x-0 top-0 h-{} bg-gradient-to-b from-base-100 to-transparent pointer-events-none", height)} />
        }.into_any(),
        "bottom" => view! {
            <div class={format!("absolute inset-x-0 bottom-0 h-{} bg-gradient-to-t from-base-100 to-transparent pointer-events-none", height)} />
        }.into_any(),
        _ => view! {
            <>
                <div class={format!("absolute inset-x-0 top-0 h-{} bg-gradient-to-b from-base-100 to-transparent pointer-events-none", height)} />
                <div class={format!("absolute inset-x-0 bottom-0 h-{} bg-gradient-to-t from-base-100 to-transparent pointer-events-none", height)} />
            </>
        }.into_any(),
    }
}
