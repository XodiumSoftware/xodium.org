use chrono::Datelike;
use leptos::prelude::*;

#[component]
pub fn Footer() -> impl IntoView {
    let home_page = "/";
    let current_year = chrono::Utc::now().year();
    let footer_links = vec![
        ("https://github.com/XodiumSoftware", "About"),
        ("https://www.gnu.org/licenses/agpl-3.0.html", "Licensing"),
        ("mailto:info@xodium.org", "Contact"),
    ];

    view! {
        <footer class="footer footer-center text-base-content p-4">
            <aside class="grid-flow-col items-center">
                <p class="font-bold">
                    {format!("© {} ", current_year)}
                    <a href=home_page class="link link-hover link-primary">
                        "XODIUM™"
                    </a> ". Open-Source (CAD) Software Company."
                </p>
            </aside>
            <nav class="grid grid-flow-col gap-4">
                {footer_links
                    .into_iter()
                    .map(|(href, text)| {
                        let target = if href.starts_with("http") { Some("_blank") } else { None };
                        let rel = if href.starts_with("http") {
                            Some("noopener noreferrer")
                        } else {
                            None
                        };
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
