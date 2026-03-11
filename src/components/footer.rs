use leptos::prelude::*;

const FOOTER_LINKS: &[(&str, &str)] = &[
    ("https://github.com/XodiumSoftware", "About"),
    ("https://www.gnu.org/licenses/agpl-3.0.html", "Licensing"),
    ("mailto:info@xodium.org", "Contact"),
];

#[component]
pub fn Footer() -> impl IntoView {
    let current_year = js_sys::Date::new_0().get_full_year();

    view! {
        <footer class="footer footer-center text-base-content p-4">
            <aside class="grid-flow-col items-center">
                <p class="font-bold">
                    {format!("© {} ", current_year)}
                    <a href="/" class="link link-hover link-primary">
                        "XODIUM™"
                    </a> ". Open-Source (CAD) Software Company."
                </p>
            </aside>
            <nav class="grid grid-flow-col gap-4">
                {FOOTER_LINKS
                    .iter()
                    .copied()
                    .map(|(href, text)| {
                        let is_external = href.starts_with("http");
                        let target = if is_external { Some("_blank") } else { None };
                        let rel = if is_external { Some("noopener noreferrer") } else { None };
                        view! {
                            <a href=href target=target rel=rel class="link link-hover link-primary">
                                {text}
                            </a>
                        }
                    })
                    .collect::<Vec<_>>()}
            </nav>
        </footer>
    }
}
