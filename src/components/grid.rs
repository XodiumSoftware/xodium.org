use leptos::prelude::*;

#[component]
pub fn Grid() -> impl IntoView {
    view! {
        <div class="absolute inset-0 h-full w-full grid-bg pointer-events-none" />
    }
}
