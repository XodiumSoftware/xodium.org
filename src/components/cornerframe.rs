use leptos::prelude::*;

#[component]
pub fn CornerFrame(
    children: Children,
    #[prop(default = "angle")] style: &'static str,
    #[prop(default = "")] class: &'static str,
) -> impl IntoView {
    // Determine bracket characters based on style
    let (bracket_tl, bracket_tr, bracket_bl, bracket_br) = match style {
        "square" => ("┌", "┐", "└", "┘"),
        "curly" => ("╭", "╮", "╰", "╯"),
        _ => ("⟨", "⟩", "⟨", "⟩"), // angle brackets (default)
    };

    let corner_class =
        "absolute text-primary/40 font-mono text-sm leading-none pointer-events-none select-none";

    view! {
        <div class={format!("relative {}", class)}>
            // Top-left bracket
            <span class={format!("{} -top-2 -left-1", corner_class)}>
                {bracket_tl}
            </span>
            // Top-right bracket
            <span class={format!("{} -top-2 -right-1", corner_class)}>
                {bracket_tr}
            </span>
            // Bottom-left bracket
            <span class={format!("{} -bottom-2 -left-1", corner_class)}>
                {bracket_bl}
            </span>
            // Bottom-right bracket
            <span class={format!("{} -bottom-2 -right-1", corner_class)}>
                {bracket_br}
            </span>
            // Content
            {children()}
        </div>
    }
}
