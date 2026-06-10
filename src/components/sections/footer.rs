use crate::i18n::*;
use leptos::prelude::*;

const FOOTER_LINKS: &[(&str, &str)] = &[
    ("https://github.com/XodiumSoftware", "About"),
    ("https://www.gnu.org/licenses/agpl-3.0.html", "Licensing"),
    ("mailto:info@xodium.org", "Contact"),
];

const GIT_SHA: &str = env!("GIT_SHA");
const GITHUB_REPO_URL: &str = "https://github.com/XodiumSoftware/xodium.org/commit";

fn clean_sha() -> &'static str {
    GIT_SHA.strip_suffix("-dirty").unwrap_or(GIT_SHA)
}

#[component]
pub fn Footer() -> impl IntoView {
    let i18n = use_i18n();
    let current_year = js_sys::Date::new_0().get_full_year();
    let commit_url = format!("{}/{}", GITHUB_REPO_URL, clean_sha());

    view! {
        <footer class="text-base-content px-6 lg:px-8 py-4">
            <div class="mx-auto max-w-7xl flex flex-col-reverse md:flex-row md:justify-between items-center gap-4">
                <aside class="max-md:w-full max-md:text-center" style="container-type: inline-size">
                    <div class="flex flex-col md:flex-row md:items-center gap-1 md:gap-0">
                        <p class="font-bold whitespace-nowrap max-md:text-[clamp(0.5rem,3.1cqw,1rem)]">
                            {format!("© {} ", current_year)}
                            <a href="/" class="link link-hover link-primary">
                                {t!(i18n, footer.company_name)}
                            </a>
                            {t!(i18n, footer.tagline)}
                        </p>
                        <a
                            href={commit_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            class="link link-hover text-base-content/50 hover:link-primary font-mono text-sm md:ml-1"
                        >
                            {format!("#{}", GIT_SHA)}
                        </a>
                    </div>
                </aside>
                <nav class="flex flex-row gap-4">
                    {FOOTER_LINKS
                        .iter()
                        .copied()
                        .map(|(href, text)| {
                            let is_external = href.starts_with("http");
                            let target = if is_external { Some("_blank") } else { None };
                            let rel = if is_external { Some("noopener noreferrer") } else { None };
                            view! {
                                <a
                                    href=href
                                    target=target
                                    rel=rel
                                    class="link link-hover link-primary"
                                >
                                    {text}
                                </a>
                            }
                        })
                        .collect::<Vec<_>>()}
                </nav>
            </div>
        </footer>
    }
}
