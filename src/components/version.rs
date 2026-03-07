use leptos::prelude::*;

#[component]
pub fn Version(version: &'static str) -> impl IntoView {
    view! {
        <div class="fixed bottom-0 m-2 text-base-content/60 text-sm hidden 2xl:block">
            "v" {version}
        </div>
    }
}
